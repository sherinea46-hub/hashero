
HashHero v4 — SPA (GitHub Pages + Vercel Safe)

Files:
- index.html — Single-page app (all tools as sections)
- assets/style.css — Unified dark theme
- vercel.json — Rewrites all routes to index.html (Vercel)
- 404.html — Forwards unknown paths to SPA hash (GitHub Pages)
- .nojekyll — Prevents Jekyll from altering files on GitHub Pages

Deploy on Vercel:
1) Import this folder as a project.
2) vercel.json already rewrites all paths to /index.html.
3) Visit https://<your-project>.vercel.app/#captions, etc.

Deploy on GitHub Pages:
1) Create a repo and push these files (or upload).
2) Enable GitHub Pages (root branch).
3) 404.html auto-forwards deep links to the SPA hash.
4) Use routes like https://<user>.github.io/<repo>/#utm

Tip: If you previously had /tools/*.html, the self-healing script in index.html will redirect those URLs to the right hash routes.
