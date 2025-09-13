// /api/ask.js — Clean CommonJS handler
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const question = body.question;
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    if (!question) return res.status(400).json({ error: 'Missing question' });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
    }

    const payload = {
      model: 'gpt-4o-mini',
      instructions: 'You are HashHero’s helpful AMA assistant. Be concise and accurate.',
      input: [...history, { role: 'user', content: question }]
    };

    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const txt = await r.text();
    if (!r.ok) {
      return res.status(502).json({ error: 'OpenAI error', status: r.status, detail: txt });
    }

    let data; try { data = JSON.parse(txt); } catch (e) {
      return res.status(500).json({ error: 'Bad JSON from OpenAI', detail: txt.slice(0, 400) });
    }
    return res.status(200).json({ answer: data.output_text || 'No answer' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e && e.message || e) });
  }
};
