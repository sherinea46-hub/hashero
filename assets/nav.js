
(function(){
  var isTools = /(^|\/)tools\//.test(location.pathname);
  var P = isTools ? '../' : '';
  var NAV = ''
  + '<nav class="nav">'
  + '  <div class="nav-inner">'
  + '    <a class="brand" href="'+P+'index.html">'
  + '      <img src="'+P+'assets/logo.svg" alt="HashHero logo" />'
  + '      <span>HashHero</span>'
  + '    </a>'
  + '    <div style="margin-left:auto; display:flex; align-items:center; gap:12px;">'
  + '      <div class="tools-menu">'
  + '        <button id="toolsToggle" class="tools-button" aria-haspopup="true" aria-expanded="false">Tools ▾</button>'
  + '        <div class="tools-dropdown" role="menu">'
  + '          <a href="'+P+'tools/hashtags.html" role="menuitem" data-tool="hashtags">Hashtags</a>'
  + '          <a href="'+P+'tools/aesthetic-text.html" role="menuitem">Aesthetic</a>'
  + '          <a href="'+P+'tools/thumbnail.html" role="menuitem">Thumbnail</a>'
  + '          <a href="'+P+'tools/captions.html" role="menuitem">Captions</a>'
  + '          <a href="'+P+'tools/username.html" role="menuitem">Username</a>'
  + '          <a href="'+P+'tools/emoji-combos.html" role="menuitem">Emoji Combos</a>'
  + '          <a href="'+P+'tools/bio-ideas.html" role="menuitem">Bio Ideas</a>'
  + '          <a href="'+P+'tools/engagement.html" role="menuitem">Engagement</a>'
  + '          <a href="'+P+'tools/polls.html" role="menuitem">Polls</a>'
  + '          <a href="'+P+'tools/pfp.html" role="menuitem">PFP</a>'
  + '          <a href="'+P+'tools/qr.html" role="menuitem">QR</a>'
  + '          <a href="'+P+'tools/gif.html" role="menuitem">GIF</a>'
  + '        </div>'
  + '      </div>'
  '    </div>'
  + '  </div>'
  + '</nav>';

  var mount = document.getElementById('site-nav');
  if (mount) mount.innerHTML = NAV;

  (function(){
    var menu = document.querySelector('.tools-menu');
    var toolsBtn = document.getElementById('toolsToggle');
    function closeMenu(){ if(menu){ menu.classList.remove('open'); } if(toolsBtn){ toolsBtn.setAttribute('aria-expanded','false'); } }
    if(toolsBtn && menu){
      toolsBtn.addEventListener('click', function(e){
        e.stopPropagation();
        var open = menu.classList.toggle('open');
        toolsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function(e){ if(menu && !menu.contains(e.target)) closeMenu(); });
      document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
    }
  })();

  (function(){
    var hashtagsLink = document.querySelector('.tools-dropdown a[data-tool="hashtags"]');
    if (hashtagsLink) hashtagsLink.classList.add('is-primary');
    var path = location.pathname.split('/').pop();
    if (path) {
      var active = document.querySelector('.tools-dropdown a[href$="'+path+'"]');
      if (active) active.classList.add('active');
    }
  })();
})();
