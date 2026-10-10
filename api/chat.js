// Vercel Serverless Function: POST /api/chat
// Secret API key is stored only in Vercel Environment Variables.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST ist erlaubt.' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Der KI-Server ist noch nicht eingerichtet: OPENAI_API_KEY fehlt in den Vercel-Umgebungsvariablen.' });

  try {
    const body = req.body || {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) return res.status(400).json({ error: 'Bitte gib eine Nachricht ein.' });
    if (message.length > 12000) return res.status(413).json({ error: 'Die Nachricht ist zu lang (maximal 12.000 Zeichen).' });

    const history = Array.isArray(body.history) ? body.history.slice(-16) : [];
    const input = history
      .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 10000) }));

    const content = [{ type: 'input_text', text: message }];
    if (Array.isArray(body.images)) {
      for (const image of body.images.slice(0, 3)) {
        if (typeof image === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(image) && image.length <= 8_000_000) {
          content.push({ type: 'input_image', image_url: image });
        }
      }
    }
    input.push({ role: 'user', content: content.length === 1 ? message : content });

    const payload = {
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: `Du bist Wintiq, ein leistungsfähiger, freundlicher KI-Assistent. Antworte standardmäßig auf Deutsch und passe dich der Sprache des Nutzers an. Hilf bei Erklärungen, Mathematik, Programmierung, Schreiben, Planung, Lernen, Analyse und kreativen Aufgaben. Liefere vollständige, praktisch nutzbare Antworten. Bei Code nenne relevante Dateien und erkläre die Anwendung. Erfinde keine Fakten oder Quellen; kennzeichne Unsicherheit. Wenn Websuche verfügbar ist, nutze sie für aktuelle oder überprüfungsbedürftige Fakten und verlinke passende Quellen. Wenn ein Bild angehängt ist, analysiere es sorgfältig. Du kannst in diesem Chat selbst keine Bilder erzeugen; dafür gibt es die separate Bildfunktion der Website.`,
      input,
      max_output_tokens: 4000,
      ...(body.webSearch === true ? { tools: [{ type: 'web_search' }] } : {})
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    let upstream;
    try {
      upstream = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } finally { clearTimeout(timeout); }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const status = upstream.status === 401 ? 502 : upstream.status;
      return res.status(status).json({ error: data.error?.message || `Der KI-Anbieter hat einen Fehler gemeldet (HTTP ${upstream.status}).` });
    }
    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === 'output_text')
      .map(part => part.text || '')
      .join('\n');
    return res.status(200).json({ answer: answer || 'Ich konnte diesmal keine Textantwort erstellen.' });
  } catch (error) {
    if (error?.name === 'AbortError') return res.status(504).json({ error: 'Die Anfrage dauerte zu lange. Bitte versuche es noch einmal.' });
    console.error('Wintiq chat error:', error?.message || error);
    return res.status(500).json({ error: 'Interner Fehler beim Verarbeiten der Anfrage. Bitte versuche es erneut.' });
  }
}
