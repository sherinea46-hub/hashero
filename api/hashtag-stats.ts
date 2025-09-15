// Vercel Serverless Function — Hashtag Stats (popularity tiers + impact score)
// NOTE: Instagram Graph API does not expose global hashtag usage counts.
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/hashtag-search/
// This endpoint provides a mock/heuristic tiering by default. To plug a real provider,
// set HASHHERO_STATS_PROVIDER and implement provider logic below.
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST" } });
    const body = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
    const tags: string[] = body?.tags||[];
    const platform = body?.platform||"Instagram";
    if (!Array.isArray(tags) || tags.length===0) return res.status(400).json({ error: { message: "Missing 'tags' array" } });

    // Provider hook (placeholder)
    const provider = process.env.HASHHERO_STATS_PROVIDER || "mock";

    let stats:any[] = [];
    if (provider === "mock") {
      // Heuristic tiers: shorter tags and very generic words => more competitive (frequent)
      // longer, specific => average/rare. Impact blends our generator score signals.
      for (const t of tags) {
        const lc = t.toLowerCase();
        let popularity:"frequent"|"average"|"rare" = "average";
        if (lc.length <= 6) popularity = "frequent";
        if (lc.length >= 12) popularity = "rare";
        if (["travel","food","fitness","music","love","fashion"].includes(lc)) popularity = "frequent";
        if (lc.includes("tokyo")||lc.includes("paris")||lc.includes("guide")||lc.includes("vlog")) popularity = "average";
        // Impact: 0-1 — base on length (readability), specificity, and platform boosts
        let impact = 0.45;
        impact += lc.length <= 10 ? 0.1 : 0;
        impact += lc.includes("guide")||lc.includes("tips")||lc.includes("howto") ? 0.15 : 0;
        if (platform==="Instagram" && ["reels","instareels","explorepage"].includes(lc)) impact += 0.2;
        impact = Math.max(0.05, Math.min(0.98, impact));
        stats.push({ tag: t, popularity, impact });
      }
    } else {
      // Example skeleton if integrating a vendor that returns numeric volumes:
      // const vendorKey = process.env.HASHHERO_STATS_KEY;
      // const r = await fetch("https://vendor.example.com/hashtag_stats", { ... });
      // Map vendor volumes to tiers and compute impact.
      // stats = mapVendorToStats(await r.json());
      return res.status(501).json({ error: { message: "Provider not configured" } });
    }

    return res.status(200).json({ stats, provider });
  } catch (e:any) {
    return res.status(500).json({ error: { message: e?.message ?? String(e) } });
  }
}
