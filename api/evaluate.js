// Proxy serverless function — keeps ANTHROPIC_API_KEY server-side only.
// Receives { system, messages } from the browser, forwards to Anthropic,
// returns { text } with the raw model response.
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor.' });
  }

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
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
  } catch (err) {
    return res.status(502).json({ error: `No se pudo contactar Anthropic: ${err.message}` });
  }

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(body);
  }

  const data = await upstream.json();
  return res.status(200).json({ text: data.content?.[0]?.text ?? '' });
};
