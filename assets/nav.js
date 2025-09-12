
(function(){
  var isTools = /(^|\/)(tools)\//.test(location.pathname);
  var P = isTools ? '../' : '';
  // Header
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

  // Ensure both base css (if present) and override css are applied.
  function ensureCss(href){
    var exists = Array.from(document.querySelectorAll('link[rel=stylesheet]')).some(function(l){
      return (l.getAttribute('href')||'').indexOf(href) !== -1;
    });
    if(!exists){
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = P + href + '?v=allinone';
      document.head.appendChild(link);
    }
  }
  ensureCss('assets/hashhero.css');               // if your site already uses this
  ensureCss('assets/site-theme-override.css');    // force homepage look on tools
})();