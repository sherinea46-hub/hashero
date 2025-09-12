
(function(){
  var isTools = /(^|\/)tools\//.test(location.pathname);
  var P = isTools ? '../' : '';
  var NAV = ''
    + '<nav class="nav">'
    + '  <div class="nav-inner">'
    + '    <a class="brand" href="'+P+'index.html">'
    + '      <img src="'+P+'assets/logo.svg" alt="HashHero logo" style="width:22px;height:22px;vertical-align:middle" />'
    + '      <span style="margin-left:8px">HashHero</span>'
    + '    </a>'
    + '    <span class="brand-badge">Hashtags First</span>'
    + '    <div class="filler small">Add‑on tools for creators</div>'
    + '  </div>'
    + '</nav>';
  var mount = document.getElementById('site-nav');
  if (mount) mount.innerHTML = NAV;
})();
