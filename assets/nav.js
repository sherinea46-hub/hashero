
(function(){
  var NAV = ''
    + '<nav class="nav">'
    + '  <div class="nav-inner">'
    + '    <a class="brand" href="index.html"><span>HashHero</span></a>'
    + '    <span class="brand-badge">Hashtags First</span>'
    + '    <div class="filler small">Add‑on tools for creators</div>'
    + '  </div>'
    + '</nav>';
  var mount = document.getElementById('site-nav');
  if (mount) mount.innerHTML = NAV;
})();
