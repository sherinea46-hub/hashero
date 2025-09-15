// Vercel Serverless Function (Node runtime)
// File: api/ask.ts

export default async function handler(req: any, res: any) {
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      res.setHeader("access-control-allow-origin", "*");
      res.setHeader("access-control-allow-methods", "POST, OPTIONS");
      res.setHeader("access-control-allow-headers", "content-type, x-hashhero-health");
      return res.status(204).end();
    }

    // Health check
    if (req.headers["x-hashhero-health"] === "ping") {
      return res.status(200).send("ok");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: { message: "Use POST" } });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const question = body?.question;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: { message: "Missing 'question' in JSON body" } });
    }

    // Mock mode
    const MOCK = process.env.HASHHERO_MOCK === "1";
    if (MOCK) return res.status(200).send(`You asked: "${question}". (MOCK reply)`);

    // Live mode
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: { message: "Server missing OPENAI_API_KEY" } });
    }

    const model = process.env.HASHHERO_MODEL || "gpt-4o-mini";
    const sys = process.env.HASHHERO_SYSTEM_PROMPT || "You are a concise, helpful AMA assistant.";

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: sys },
          { role: "user", content: question },
        ],
        max_output_tokens: 600,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: { message: `Upstream error: ${r.status} ${txt}` } });
    }

    const data = await r.json();

    // Prefer output_text if present, otherwise dig into content
    let text = data?.output_text;
    if (!text && Array.isArray(data?.output)) {
      const first = data.output[0];
      if (first?.content?.[0]?.text) {
        text = first.content[0].text;
      }
    }

    if (!text) text = "⚠️ OpenAI response did not include text.";

    res.setHeader("content-type", "text/plain; charset=utf-8");
    return res.status(200).send(text);

  } catch (e: any) {
    return res.status(500).json({ error: { message: e?.message ?? String(e) } });
  }
}
