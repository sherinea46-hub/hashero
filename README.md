# HashHero Minimal Site (Generator + Ask AI + QR + Timer)

This build renames **AMA** to **Ask AI**, adds a promo card at the top, highlights the nav item, and includes example prompts that auto-run.

**Files**
- `index.html`
- `assets/css/site.css`
- `assets/js/app.js`
- `api/ask.ts` (serverless)
- `README.md`

**Deploy**
1. Upload to your repo (preserve folders). Commit to `main`.
2. In Vercel → Settings → Environment Variables:
   - `OPENAI_API_KEY = <your key>`
   - `HASHHERO_MOCK = 1` for testing, then set to `0` to go live.
3. Redeploy and test **Ask AI**.
