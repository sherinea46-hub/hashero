HashHero v3.1 — Enforced Dark Theme
- All pages include a small inline "critical" CSS block so the dark background appears even if the stylesheet path is wrong.
- Full theme is in /assets/style.css (also copied to /tools/assets/style.css for hosts that sandbox subfolders).
- If you still see white pages, do a Hard Refresh (Ctrl+F5) to clear cached CSS.

How to replace:
1) Upload the whole folder.
2) Make sure index.html and /assets/ are at the same level.
3) Tools live in /tools/. Each tool page references ../assets/style.css.
4) If your host serves tools in isolation, they will also find /tools/assets/style.css (fallback).

Customize colors in assets/style.css under :root.
