
HashHero — Minimal Patch (Non-Destructive)
=========================================

This patch avoids modifying your existing pages. It only adds:
- meme.html   (new page)
- sitemap.xml (new file)

How to deploy safely
--------------------
1) Do NOT overwrite index.html or about.html.
2) Upload meme.html to your site root.
3) Add a "Meme" menu link in your existing nav (example below).
4) Put sitemap.xml at the site root and update the domain inside it, then submit in Search Console.

Nav link snippet (add one line only)
------------------------------------
<!-- Find your existing menu and just add this one line among other <a> items -->
<a href="/meme.html">Meme</a>

Site-wide disclaimer (optional, safe)
-------------------------------------
Paste this small block above your existing <footer> on pages where you want it.
If your site already has a 'card' class, keep it. Otherwise, use a simple <div>.

<div class="card" style="margin:20px auto; max-width:850px; border:1px dashed rgba(255,255,255,0.2); background:rgba(255,255,255,0.03); border-radius:14px; padding:14px;">
  <strong>Disclaimer:</strong>
  <p class="small muted" style="margin-top:6px;">
    Meme templates from Imgflip or other sources may be subject to copyright.
    They are provided here for parody, commentary, and educational purposes only.
    Please ensure you have rights or fair-use justification before publishing memes made with third-party images.
    You are always safe using your own uploads or the built-in blank templates.
  </p>
</div>

Rollback tips
-------------
• Vercel: go to Deployments → select a previous successful deployment → Promote.
• GitHub: restore the prior commit (or just restore index.html/about.html from history).

Notes
-----
• meme.html is self-contained and uses conservative styles to avoid clashing with your CSS.
• sitemap.xml uses a placeholder domain; replace it with your real domain before deploying.
