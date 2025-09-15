# HashHero AMA Add‑On (Static Vercel Site)

This package adds a working **/ama** page and a serverless backend **/api/ask** to a static site hosted on Vercel.

## Contents
- `ama/index.html` — standalone AMA UI (plain HTML/JS)
- `api/ask.ts` — Vercel Serverless Function that talks to OpenAI Responses API
- `README.md` — this file

## How to install (GitHub web UI)
1. In your repo, click **Add file → Upload files**, and upload the two folders from this zip: `ama/` and `api/`.
2. Commit to `main`. Vercel will redeploy automatically.

> If you already have `app/`-based Next.js pages, **do not** keep a duplicate `app/ama/page.tsx` — it will conflict with `ama/index.html`. Use **either** the static page (`ama/index.html`) **or** Next.js App Router, not both.

## Environment variables (Vercel → Project → Settings → Environment Variables)
- `OPENAI_API_KEY` — your OpenAI API key
- `HASHHERO_MOCK` — set to `1` for first test (returns mock text), then `0` to go live
- *(optional)* `HASHHERO_MODEL` — default `gpt-4o-mini`
- *(optional)* `HASHHERO_SYSTEM_PROMPT` — default: "You are a concise, helpful AMA assistant."

After saving env vars, redeploy or push a commit.

## Test
- Open `/ama` on your domain, e.g. `https://your-site.vercel.app/ama`
- Click **Health** → should alert "API is up ✅"
- Ask a question → with `HASHHERO_MOCK=1` you’ll see a mock reply
- Set `HASHHERO_MOCK=0` and redeploy for real responses

## Notes
- This package assumes a **static** site on Vercel. If you later migrate to Next.js, place the AMA page at `app/ama/page.tsx` and the API route at `app/api/ask/route.ts` (Edge runtime), and remove the static `ama/` + root `api/` to avoid route conflicts.
