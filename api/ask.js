// /api/ask.js — safe CommonJS version
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const question = body.question;
    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
    }

    // Call OpenAI
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [{ role: 'user', content: question }]
      })
    });

    const txt = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ error: 'OpenAI error', detail: txt });
    }

    let data;
    try { data = JSON.parse(txt); } catch {
      return res.status(500).json({ error: 'Bad JSON from OpenAI', detail: txt.slice(0, 300) });
    }

    return res.status(200).json({ answer: data.output_text || 'No answer' });
  } catch (err) {
    return res.status(500).json({ error: 'Server crash', detail: String(err && err.message || err) });
  }
};
