# HashHero — Mobile-Optimized Build

What’s new:
- **Mobile-first nav**: horizontal scrollable nav pills.
- **Stacked Ask AI controls** on phones with full-width buttons.
- **Smaller, responsive timer** (max ~300px, 80vw on small screens).
- Tightened paddings, font sizes, and chip sizes for narrow viewports.

Deploy:
1. Upload contents to your repo (preserve folders), commit to `main`.
2. In Vercel → Environment Variables:
   - `OPENAI_API_KEY = <your key>`
   - `HASHHERO_MOCK = 1` for testing; switch to `0` for live.
3. Redeploy and test on phone (Ask AI examples auto-run & scroll).

