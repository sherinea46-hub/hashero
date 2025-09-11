# HashHero — Static Site (Full Fixed)

This ZIP contains a **deployable static site** with the HashHero homepage and tools pages.

## Structure
```
/index.html
/tools/
  qr.html
  meme.html
  hashtags.html
  gif.html
  polls.html
```

## Deploy to Vercel
1. Create a new project in Vercel → **Other** (static site).
2. Set **Build Command**: _None_ (or leave blank).  
   Set **Output Directory**: `/` (the root).  
3. Drag-and-drop this folder, or push to a repo and import.
4. Test pages: `/tools/qr.html`, `/tools/meme.html`, `/tools/hashtags.html`, `/tools/gif.html`, `/tools/polls.html`.

> SPA rewrites are **not** required since this is a **multi-page** static site.

## Use with GoDaddy domain
- In GoDaddy DNS:
  - If pointing your apex (root) to Vercel: set **A** record `@` → `76.76.21.21` and **CNAME** for `www` → `cname.vercel-dns.com`.
  - Add the domain to your Vercel project and verify.
- If you have another main site on the same domain and want **only** `/tools` here, add this project to the same domain with **Path = /tools** in Vercel (Domain Paths).

## Notes
- **GIF Maker** uses a small client-side lib from CDN (`gifshot`). No server required.
- **Polls** use per-device `localStorage`. For shared, real-time polls, add a small backend (e.g., Supabase) later.
- Add your own `favicon.ico` to the root if desired.
