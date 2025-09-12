// /assets/site.js — shared dropdown + theme + standardized menu
(function(){
  var menu = document.querySelector('.tools-menu');
  var btn = document.getElementById('toolsToggle');
  var dd = menu ? menu.querySelector('.tools-dropdown') : null;

  function closeMenu(){
    if(menu){ menu.classList.remove('open'); }
    if(btn){ btn.setAttribute('aria-expanded','false'); }
  }
  if(btn && dd){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function(e){
      if(menu && !menu.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeMenu();
    });
  }

  if(dd){
    var items = [
      {href:'/tools/hashtags.html', label:'Hashtags'},
      {href:'/tools/qr.html', label:'QR'},
      {href:'/tools/meme.html', label:'Meme'},
      {href:'/tools/gif.html', label:'GIF'},
      {href:'/tools/polls.html', label:'Polls'},
      {href:'/tools/captions.html', label:'Captions'},
      {href:'/tools/thumbnail.html', label:'Thumbnail'},
      {href:'/tools/username.html', label:'Username'},
      {href:'/tools/emoji-combos.html', label:'Emoji Combos'},
      {href:'/tools/bio-ideas.html', label:'Bio Ideas'},
      {href:'/tools/pfp.html', label:'PFP'},
      {href:'/tools/engagement.html', label:'Engagement'}
    ];
    dd.innerHTML = items.map(function(i){ return '<a href="'+i.href+'" role="menuitem">'+i.label+'</a>'; }).join('\n');
  }

  var root = document.documentElement;
  var tbtn = document.getElementById('themeToggle');
  function setTheme(t){
    if(t==='light'){
      root.setAttribute('data-theme','light'); localStorage.setItem('hh_theme','light');
      if(tbtn) tbtn.textContent='☀️';
    }else{
      root.setAttribute('data-theme','dark'); localStorage.setItem('hh_theme','dark');
      if(tbtn) tbtn.textContent='🌙';
    }
  }
  var saved = localStorage.getItem('hh_theme');
  if(saved){ setTheme(saved); }
  else{
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  }
  if(tbtn){ tbtn.addEventListener('click', function(){ var cur=root.getAttribute('data-theme')||'dark'; setTheme(cur==='dark'?'light':'dark'); }); }
})();