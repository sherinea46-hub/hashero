# HashHero — URL-to-Keywords + Timer Reset

New features:
- **Instagram URL input** → fetch caption (oEmbed if token set, else best-effort HTML) → extract keywords → feed the generator.
- **Timer Reset** button (clears ring and clock back to 00:00).

Other features kept:
- Smart Generator with **popularity tiers** & **impact score** (mock provider by default)
- **Image upload** → AI Vision keywords
- **Ask AI** with Clear, mobile-optimized layout, smaller timer

## Env (Vercel → Settings → Environment Variables)
- `OPENAI_API_KEY` — required for Ask AI and Image keywords (if `HASHHERO_MOCK=0`)
- `HASHHERO_MOCK` — `1` for testing (mock data), `0` for live
- `HASHHERO_VISION_MODEL` — optional (e.g., `gpt-4o-mini`)
- `HASHHERO_STATS_PROVIDER` — optional (plug vendor if you have one)
- `HASHHERO_IG_OEMBED_TOKEN` — optional (Facebook App token to use Instagram oEmbed for captions)

## Notes
- Instagram may block raw HTML fetches; oEmbed with a token is the most reliable way.
- We do **not** scrape IG beyond reading the caption via oEmbed or meta description when available.
