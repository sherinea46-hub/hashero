// Vercel Serverless Function — Image -> Keywords via OpenAI Vision
export const config = { api: { bodyParser: { sizeLimit: "8mb" } } }; // allow larger images
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST" } });
    const { image_b64, platform } = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
    if (!image_b64) return res.status(400).json({ error: { message: "Missing image_b64" } });

    const MOCK = process.env.HASHHERO_MOCK === "1";
    if (MOCK) {
      return res.status(200).json({ keywords: ["coffee", "latteart", "cozy", "cafe", "morning", "vlog", "paris", "bistro"] });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return res.status(500).json({ error: { message: "Server missing OPENAI_API_KEY" } });

    const prompt = `Extract 8-15 short, lowercase keywords from this image that could help generate social hashtags. Prefer concrete subjects (e.g., 'latteart', 'streetstyle', 'sunset', 'tokyo', 'travelvlog'). Platform: ${platform||"Instagram"}. Return as a JSON array of strings only.`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.HASHHERO_VISION_MODEL || "gpt-4o-mini",
        input: [
          { role: "user", content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_base64: image_b64 }
          ]}
        ],
        max_output_tokens: 500
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: { message: `Upstream error: ${r.status} ${txt}` } });
    }

    const data = await r.json();
    let text = data?.output_text || "";
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return res.status(200).json({ keywords: parsed });
    } catch(e){}
    // Fallback: try to dig
    const first = data?.output?.[0]?.content?.find?.((x:any)=>x?.text)?.text;
    try {
      const parsed = JSON.parse(first||"[]");
      if (Array.isArray(parsed)) return res.status(200).json({ keywords: parsed });
    } catch(e){}
    return res.status(200).json({ keywords: [] });
  } catch (e: any) {
    return res.status(500).json({ error: { message: e?.message ?? String(e) } });
  }
}
