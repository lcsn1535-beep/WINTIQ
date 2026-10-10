// Vercel Serverless Function: POST /api/image
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST ist erlaubt.' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Der Bilddienst ist noch nicht eingerichtet: OPENAI_API_KEY fehlt in den Vercel-Umgebungsvariablen.' });

  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) return res.status(400).json({ error: 'Bitte beschreibe das Bild, das du erstellen möchtest.' });
    if (prompt.length > 4000) return res.status(413).json({ error: 'Die Bildbeschreibung ist zu lang (maximal 4.000 Zeichen).' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 110000);
    let upstream;
    try {
      upstream = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', prompt, size: '1024x1024', n: 1 }),
        signal: controller.signal
      });
    } finally { clearTimeout(timeout); }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const status = upstream.status === 401 ? 502 : upstream.status;
      return res.status(status).json({ error: data.error?.message || `Der Bildanbieter hat einen Fehler gemeldet (HTTP ${upstream.status}).` });
    }
    const item = data.data?.[0];
    if (item?.url) return res.status(200).json({ imageUrl: item.url, message: 'Dein Bild ist fertig.' });
    if (item?.b64_json) return res.status(200).json({ imageUrl: `data:image/png;base64,${item.b64_json}`, message: 'Dein Bild ist fertig.' });
    return res.status(502).json({ error: 'Der Bilddienst hat kein Bild zurückgegeben. Bitte versuche es erneut.' });
  } catch (error) {
    if (error?.name === 'AbortError') return res.status(504).json({ error: 'Die Bildgenerierung dauerte zu lange. Bitte versuche es erneut.' });
    console.error('Wintiq image error:', error?.message || error);
    return res.status(500).json({ error: 'Interner Fehler bei der Bildgenerierung. Bitte versuche es erneut.' });
  }
}
