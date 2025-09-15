# HashHero — Inflact-like Hashtag Generator (with Stats + Image Upload)

This build adds:
- **Popularity tiers** (Frequent / Average / Rare) and **Impact score** for each suggested hashtag.
- **Image upload** → AI extracts 8–15 keywords → appended to your description for smarter tags.
- Mobile-friendly layout, Ask AI with Clear button, smaller responsive timer.

> ⚠️ Instagram’s official Graph API **does not provide global hashtag usage counts**. You can fetch *media for a hashtag* (top/recent) and are limited to **30 unique hashtags per 7 days** per Business/Creator account, but there’s no public endpoint for total usage volume. Sources: Meta docs.  
> This build ships with a **mock/heuristic tiering** by default and a hook to connect a third‑party provider that estimates counts.

## Files
- `index.html`, `assets/css/site.css`, `assets/js/app.js`
- `api/ask.ts`
- `api/image-tags.ts` — OpenAI Vision → keywords
- `api/hashtag-stats.ts` — returns popularity + impact (mock by default)

## Env Vars (Vercel → Settings → Environment Variables)
- `OPENAI_API_KEY` = your key
- `HASHHERO_MOCK` = `1` to test (image/ask endpoints return mock data), `0` for live
- `HASHHERO_VISION_MODEL` = (optional) e.g. `gpt-4o-mini`
- `HASHHERO_STATS_PROVIDER` = (optional) set to your vendor flag if you integrate one

## How to connect a real stats provider
1. Pick a data vendor (beware of ToS; Meta API does **not** expose counts).  
2. Add your fetch logic in `api/hashtag-stats.ts` under the provider block. Map vendor volume → tiers:
   - `> 5M` = frequent, `200k–5M` = average, `< 200k` = rare (example thresholds)
3. Return `{ tag, popularity, impact }` for each; UI will render badges and an impact bar.

## Usage
- Type a description and click **Generate**. Click **Show Details** to see tier + impact per tag.
- Or upload an image → **Analyze Image** to pull keywords into the description, then **Generate**.

