/* HashHero smart generator (platform-biased) */
(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  ready(function(){
    const kw = document.getElementById('kw');
    const btn = document.getElementById('generate');
    const results = document.getElementById('results');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const platformSel = document.getElementById('platform');
    if(!kw || !btn || !results) return;

    const RULES = {
      auto:      { max: 15, case: 'lower', season: ['viral','trending','explore'] },
      tiktok:    { max: 5,  case: 'lower', season: ['fyp','viral','trending','shorts'] },
      instagram: { max: 30, case: 'camel', season: ['explore','viral','reels'] },
      facebook:  { max: 3,  case: 'lower', season: ['viral'] },
      x:         { max: 2,  case: 'lower', season: ['trending'] },
      youtube:   { max: 3,  case: 'lower', season: ['shorts','trending'] }
    };
    function getPlat(){ return (platformSel && platformSel.value) || 'auto'; }

    // ---- Local deterministic generator ----
    const STOP = new Set(("a an the and or of to in on for with from by is are was were be been at as that this it your you our we i me my mine his her their they them he she do does did not no yes too very just much many more most less few over under again only own same so than then once each both any some such own other into out up down off above below why how all can will should could would might must may".split(" ")));
    function norm(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
    function title(s){ return s.replace(/(^|\s)\S/g, t=>t.toUpperCase()); }
    function uniq(a){ return Array.from(new Set(a)); }
    function words(s){ return norm(s).split(' ').filter(Boolean).filter(w=>!STOP.has(w)); }
    const AFF = {travel:["wander","trip","journey","adventure","explore"],vlog:["vlogger","dailyvlog","creatorlife","behindthescenes"],food:["recipe","cooking","kitchen","yum","foodie"],fitness:["workout","gym","health","wellness","fit"],beauty:["makeup","skincare","glow"],music:["song","beats","remix","cover"],tech:["gadgets","coding","developer","ai","startup"],gaming:["gamer","stream","eSports","play"]};

    function caseStyle(tag, mode){
      const core = tag.replace(/^#/,'').replace(/[^A-Za-z0-9]/g,'');
      if(mode==='camel'){
        return '#'+core.replace(/(^|[\\s_\\-])\\w/g, s=>s.toUpperCase());
      }
      return '#'+core.toLowerCase();
    }

    function platformBias(tags, plat){
      const rule = RULES[plat] || RULES.auto;
      // Add seasonal/trending sprinkle
      (rule.season || []).forEach(t => tags.add('#'+t));
      // Clean, case, cap
      let arr = Array.from(tags).map(t=> caseStyle(t, rule.case));
      // Prefer shorter, topic-y tags
      arr = Array.from(new Set(arr)).sort((a,b)=> a.length - b.length);
      return arr.slice(0, rule.max);
    }

    function localGenerate(input, plat){
      const k = words(input); if(!k.length) return [];
      const keys = uniq(k).sort((a,b)=> b.length-a.length).slice(0,5);
      const set = new Set();
      keys.forEach(k => {
        set.add('#'+k);
        (AFF[k]||[]).forEach(a=> set.add('#'+a));
      });
      for(let i=0;i<keys.length;i++){
        for(let j=i+1;j<keys.length;j++){
          set.add('#'+keys[i]+keys[j]);
          set.add('#'+title(keys[i])+title(keys[j]));
        }
      }
      const phrase = keys.join(' ');
      if(phrase){
        set.add('#'+phrase.replace(/\s+/g,''));
        set.add('#'+title(phrase).replace(/\s+/g,''));
      }
      return platformBias(set, plat);
    }

    // ---- Render helpers ----
    async function copyText(txt){
      try{ await navigator.clipboard.writeText(txt); }
      catch(_){ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); } finally{ document.body.removeChild(ta); } }
    }
    function render(tags, note){
      results.innerHTML='';
      if(note){
        const n=document.createElement('div'); n.className='muted'; n.style.cssText='padding:8px 12px;opacity:.75'; n.textContent=note; results.appendChild(n);
      }
      if(!tags || !tags.length){
        const empty = document.createElement('div'); empty.className='muted'; empty.style.cssText='padding:12px 16px;opacity:.8';
        empty.textContent='Type a description or topic and press Generate';
        results.appendChild(empty); return;
      }
      const cont=document.createElement('div');
      tags.forEach(tag=>{
        if(!/^#/.test(tag)) tag='#'+tag.replace(/[^A-Za-z0-9]/g,'');
        const row=document.createElement('div'); row.className='hh-row';
        const left=document.createElement('div'); left.className='hh-tag'; left.textContent=tag;
        const b=document.createElement('button'); b.className='hh-copy btn'; b.textContent='Copy';
        b.addEventListener('click', async()=>{ const old=b.textContent; await copyText(tag); b.textContent='Copied!'; setTimeout(()=>b.textContent=old, 800); });
        row.appendChild(left); row.appendChild(b); cont.appendChild(row);
      });
      results.appendChild(cont);
      if(copyAllBtn){ copyAllBtn.onclick = async()=>{ await copyText(tags.join(' ')); const old=copyAllBtn.textContent; copyAllBtn.textContent='Copied All!'; setTimeout(()=>copyAllBtn.textContent=old, 900); }; }
    }

    // ---- AI gateway ----
    async function aiGenerate(promptText, plat){
      const rule = RULES[plat] || RULES.auto;
      const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), 14000);
      try{
        const res = await fetch('/api/hashtags', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text: promptText, n: rule.max, platform: plat })
        });
        clearTimeout(t);
        if(!res.ok) throw new Error('AI endpoint error '+res.status);
        const data = await res.json();
        if(Array.isArray(data.tags) && data.tags.length>0){ return data.tags.slice(0, rule.max); }
        return null;
      }catch(e){
        clearTimeout(t);
        return null;
      }
    }

    function looksLikeDescription(s){
      return (s||'').trim().split(/\s+/).length >= 5 || /[.!?\n,]/.test(s||'');
    }

    async function onGenerate(){
      const text = kw.value.trim();
      const plat = getPlat();
      if(!text){ render([]); return; }
      btn.disabled = true; btn.textContent = 'Generating…';
      render([], 'Working…');
      let tags = null;
      if(looksLikeDescription(text)){
        tags = await aiGenerate(text, plat);
        if(!tags){ render(localGenerate(text, plat), 'AI unavailable — using fast mode'); }
        else { render(tags); }
      }else{
        render(localGenerate(text, plat));
      }
      btn.disabled = false; btn.textContent = 'Generate';
    }

    btn.addEventListener('click', onGenerate);
    kw.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); onGenerate(); } });
  });
})();