// Proxy serverless function — keeps API keys server-side only.
// Receives { system, messages } from the browser, forwards to Anthropic (claude-sonnet-4-6),
// with automatic fallback to Gemini (gemini-3.6-flash) if ANTHROPIC_API_KEY is not set or fails.

async function callAnthropic(apiKey, system, messages) {
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
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
    const upstream = await fetch(url, {
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

  if (!anthropicKey && !geminiKey) {
    return res.status(500).json({
      error: 'API key no configurada en el servidor. Se requiere ANTHROPIC_API_KEY o GEMINI_API_KEY.',
    });
  }

  // Primary: Anthropic (claude-sonnet-4-6)
  if (anthropicKey) {
    const resAnthropic = await callAnthropic(anthropicKey, system, messages);
    if (resAnthropic.ok) {
      return res.status(200).json({ text: resAnthropic.text, provider: 'anthropic' });
    }
    console.warn('[ANTHROPIC CALL FAILED, TRYING GEMINI FALLBACK IF AVAILABLE]', resAnthropic.error);
    if (!geminiKey) {
      return res.status(resAnthropic.status || 500).json(resAnthropic.error);
    }
  }

  // Fallback / Secondary: Gemini (gemini-3.6-flash)
  const resGemini = await callGemini(geminiKey, system, messages);
  if (resGemini.ok) {
    return res.status(200).json({ text: resGemini.text, provider: 'gemini' });
  }

  return res.status(resGemini.status || 500).json(resGemini.error);
};

