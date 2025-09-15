# HashHero Minimal Site (Generator + AMA + QR + Timer)

**Files**
- `index.html` — all four tools
- `assets/css/site.css` — styles
- `assets/js/app.js` — behavior
- `api/ask.ts` — serverless backend for AMA

**Deploy**
1. Upload these files to your repo root (preserve folders).
2. In Vercel → Settings → Environment Variables:
   - `OPENAI_API_KEY = <your key>`
   - `HASHHERO_MOCK = 1` to test, then set to `0` to go live
3. Commit → Vercel redeploys.
