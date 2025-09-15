// /api/hashtag-stats.ts — Popularity tier + impact (mock or provider hook)
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST" } });
    const body = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
    const tags: string[] = body?.tags||[];
    const platform = body?.platform||"Instagram";
    if (!Array.isArray(tags) || tags.length===0) return res.status(400).json({ error: { message: "Missing 'tags' array" } });

    const provider = process.env.HASHHERO_STATS_PROVIDER || "mock";
    let stats:any[] = [];
    if (provider === "mock") {
      for (const t of tags) {
        const lc = t.toLowerCase();
        let popularity:"frequent"|"average"|"rare" = "average";
        if (lc.length <= 6) popularity = "frequent";
        if (lc.length >= 12) popularity = "rare";
        if (["travel","food","fitness","music","love","fashion"].includes(lc)) popularity = "frequent";
        if (lc.includes("tokyo")||lc.includes("paris")||lc.includes("guide")||lc.includes("vlog")) popularity = "average";
        let impact = 0.45;
        impact += lc.length <= 10 ? 0.1 : 0;
        impact += lc.includes("guide")||lc.includes("tips")||lc.includes("howto") ? 0.15 : 0;
        if (platform==="Instagram" && ["reels","instareels","explorepage"].includes(lc)) impact += 0.2;
        impact = Math.max(0.05, Math.min(0.98, impact));
        stats.push({ tag: t, popularity, impact });
      }
    } else {
      return res.status(501).json({ error: { message: "Provider not configured" } });
    }

    return res.status(200).json({ stats, provider });
  } catch (e:any) {
    return res.status(500).json({ error: { message: e?.message ?? String(e) } });
  }
}
