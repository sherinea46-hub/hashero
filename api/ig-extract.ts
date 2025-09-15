// /api/ig-extract.ts — Read IG post caption via oEmbed (if token) or HTML fallback
export default async function handler(req:any, res:any){
  try{
    if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST" } });
    const body = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
    const url:string = body?.url || "";
    if (!url || !/^https?:\/\//i.test(url)) return res.status(400).json({ error: { message: "Invalid URL" } });

    // Mock mode
    const MOCK = process.env.HASHHERO_MOCK === "1";
    if (MOCK){
      return res.status(200).json({ caption: "Morning workout in Paris. Cozy café after gym. Tips for beginners and budget travel!" });
    }

    // Preferred: Instagram oEmbed (requires a FB app + token)
    const token = process.env.HASHHERO_IG_OEMBED_TOKEN;
    if (token){
      const endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${encodeURIComponent(token)}`;
      const r = await fetch(endpoint);
      if (r.ok){
        const data = await r.json();
        // 'title' contains the caption text in oEmbed
        if (data?.title) return res.status(200).json({ caption: data.title });
      }
      // fallthrough if not ok
    }

    // Fallback: best-effort HTML fetch to read meta description (may fail if blocked by IG)
    const r2 = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 HashHero" } });
    if (r2.ok){
      const html = await r2.text();
      const m = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (m) return res.status(200).json({ caption: m[1] });
    }

    return res.status(200).json({ caption: "" });
  }catch(e:any){
    return res.status(500).json({ error: { message: e?.message ?? String(e) } });
  }
}
