// Proxy serverless function — keeps API keys server-side only.
// Receives { system, messages } from the browser, forwards to Anthropic (claude-sonnet-4-6),
// with automatic fallback to Gemini (gemini-3.6-flash) if ANTHROPIC_API_KEY is not set or fails.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The 40-persona run fires up to 10 concurrent evaluations, which routinely trips
// per-key rate limits on both providers. Retry 429s with backoff (honoring
// Retry-After when the provider sends one) instead of failing the persona outright.
async function fetchWithRetry429(url, options, maxRetries = 4) {
  for (let attempt = 0; ; attempt++) {
    const upstream = await fetch(url, options);
    if (upstream.status !== 429 || attempt >= maxRetries) return upstream;
    const retryAfter = Number(upstream.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 250;
    await sleep(delayMs);
  }
}

async function callAnthropic(apiKey, system, messages) {
  try {
    const upstream = await fetchWithRetry429('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system,
        messages,
      }),
    });

    const body = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return { ok: false, status: upstream.status, error: body };
    }
    return { ok: true, text: body.content?.[0]?.text ?? '' };
  } catch (err) {
    return { ok: false, status: 502, error: { error: `No se pudo contactar Anthropic: ${err.message}` } };
  }
}

async function callGemini(apiKey, system, messages) {
  const userText = messages
    .map(m => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))
    .join('\n');

  // Try Interactions API first (Gemini 3.6 Flash)
  try {
    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'gemini-3.6-flash',
        input: userText,
        system_instruction: system,
      }),
    });

    const body = await upstream.json().catch(() => ({}));
    if (upstream.ok) {
      const text =
        body.output_text ||
        body.outputText ||
        body.candidates?.[0]?.content?.parts?.[0]?.text ||
        (Array.isArray(body.outputs) ? body.outputs.map(o => o.text).join('') : '');
      if (text) return { ok: true, text };
    }
  } catch (err) {
    console.warn('[GEMINI INTERACTIONS FAIL]', err.message);
  }

  // Fallback to generateContent REST endpoint
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const upstream = await fetchWithRetry429(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: userText }] }],
      }),
    });

    const body = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return { ok: false, status: upstream.status, error: body };
    }
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { ok: true, text };
  } catch (err) {
    return { ok: false, status: 502, error: { error: `No se pudo contactar Gemini: ${err.message}` } };
  }
}

// Third-tier fallback: OpenRouter's free models. No single free model has a quota
// generous enough for a 40-call run on its own, so try several in order — if one
// is rate-limited or exhausted, move to the next rather than failing the persona.
const OPENROUTER_FREE_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',       // 550B MoE (55B active) — best-calibrated on price-elasticity + caliche in testing
  'nvidia/nemotron-3-super-120b-a12b:free',       // 120B — reliable second opinion, correct field semantics
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'openai/gpt-oss-20b:free',                      // usually fine, occasionally malforms JSON under this compound task
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-9b-v2:free',
];

async function callOpenRouter(apiKey, system, messages) {
  let lastError = { error: 'Todos los modelos gratuitos de OpenRouter fallaron.' };
  let lastStatus = 502;

  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const upstream = await fetchWithRetry429('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, ...messages],
        }),
      }, 1);

      const body = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastError = body;
        continue;
      }
      const text = body.choices?.[0]?.message?.content ?? '';
      if (text) return { ok: true, text, model };
      lastError = { error: `Respuesta vacía de ${model}` };
    } catch (err) {
      lastError = { error: `No se pudo contactar OpenRouter (${model}): ${err.message}` };
    }
  }

  return { ok: false, status: lastStatus, error: lastError };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body ?? {};
  if (!system || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Payload inválido: se requieren system y messages.' });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!anthropicKey && !geminiKey && !openrouterKey) {
    return res.status(500).json({
      error: 'API key no configurada en el servidor. Se requiere ANTHROPIC_API_KEY, GEMINI_API_KEY u OPENROUTER_API_KEY.',
    });
  }

  // Primary: Anthropic (claude-sonnet-4-6)
  if (anthropicKey) {
    const resAnthropic = await callAnthropic(anthropicKey, system, messages);
    if (resAnthropic.ok) {
      return res.status(200).json({ text: resAnthropic.text, provider: 'anthropic' });
    }
    console.warn('[ANTHROPIC CALL FAILED, TRYING NEXT PROVIDER IF AVAILABLE]', resAnthropic.error);
    if (!geminiKey && !openrouterKey) {
      return res.status(resAnthropic.status || 500).json(resAnthropic.error);
    }
  }

  // Secondary: Gemini (gemini-3.6-flash)
  if (geminiKey) {
    const resGemini = await callGemini(geminiKey, system, messages);
    if (resGemini.ok) {
      return res.status(200).json({ text: resGemini.text, provider: 'gemini' });
    }
    console.warn('[GEMINI CALL FAILED, TRYING OPENROUTER FALLBACK IF AVAILABLE]', resGemini.error);
    if (!openrouterKey) {
      return res.status(resGemini.status || 500).json(resGemini.error);
    }
  }

  // Tertiary: OpenRouter free models
  const resOpenRouter = await callOpenRouter(openrouterKey, system, messages);
  if (resOpenRouter.ok) {
    return res.status(200).json({ text: resOpenRouter.text, provider: `openrouter:${resOpenRouter.model}` });
  }

  return res.status(resOpenRouter.status || 500).json(resOpenRouter.error);
};

