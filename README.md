# HashHero (Generator + Ask AI + QR + Timer)

This build:
- Renames AMA to **Ask AI**
- Adds a promo card and example prompts
- Adds **Clear** button to Ask AI
- Shrinks & makes the **Engagement Timer** responsive

Deploy:
1) Upload to your repo (preserve folders). Commit to `main`.
2) In Vercel → Settings → Environment Variables:
   - `OPENAI_API_KEY = <your key>`
   - `HASHHERO_MOCK = 1` for testing, then set `0` to go live.
3) Redeploy and test **Ask AI** + **Timer**.
