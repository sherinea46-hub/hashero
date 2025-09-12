(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  ready(function(){
    const kw = document.getElementById('kw');
    const btn = document.getElementById('generate');
    const results = document.getElementById('results');
    const copyAllBtn = document.getElementById('copyAllBtn');
    if(!kw || !btn || !results) return;

    const STOP = new Set(("a an the and or of to in on for with from by is are was were be been at as that this it your you our we i me my mine his her their they them he she do does did not no yes too very just much many more most less few over under again only own same so than then once each both any some such own other into out up down off above below why how all can will should could would might must may").split(" "));
    function norm(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
    function title(s){ return s.replace(/(^|\s)\S/g, t=>t.toUpperCase()); }
    function uniq(a){ return Array.from(new Set(a)); }
    function words(s){ return norm(s).split(' ').filter(Boolean).filter(w=>!STOP.has(w)); }

    const AFF = {travel:["wander","trip","journey","adventure","explore"],vlog:["vlogger","dailyvlog","creatorlife","behindthescenes"],food:["recipe","cooking","kitchen","yum","foodie"],fitness:["workout","gym","health","wellness","fit"],beauty:["makeup","skincare","glow"],music:["song","beats","remix","cover"],tech:["gadgets","coding","developer","ai","startup"],gaming:["gamer","stream","eSports","play"]};

    function combos(keys){
      const base = new Set();
      for(const k of keys){ base.add('#'+k); if(AFF[k]) AFF[k].forEach(a=> base.add('#'+a)); }
      for(let i=0;i<keys.length;i++){ for(let j=i+1;j<keys.length;j++){ base.add('#'+keys[i]+keys[j]); base.add('#'+title(keys[i])+title(keys[j])); } }
      const phrase = keys.join(' ');
      if(phrase){ base.add('#'+phrase.replace(/\s+/g,'')); base.add('#'+title(phrase).replace(/\s+/g,'')); }
      ['trending','viral','explore','reels','shorts'].forEach(t=> base.add('#'+t));
      return Array.from(base);
    }

    function generate(input){
      const k = words(input); if(!k.length) return [];
      const keys = uniq(k).sort((a,b)=> b.length-a.length).slice(0,4);
      let tags = combos(keys).map(t=> t.replace(/[^#A-Za-z0-9]/g,'')).filter(t=> t.length>1 && t.length<=30);
      return tags.slice(0,15);
    }

    async function copyText(txt){
      try{ await navigator.clipboard.writeText(txt); }
      catch(_){ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); } finally{ document.body.removeChild(ta); } }
    }

    function render(tags){
      results.innerHTML='';
      if(!tags.length){ results.innerHTML='<div class="muted" style="padding:12px 16px;opacity:.8">Type a topic and press Generate</div>'; return; }
      const cont=document.createElement('div');
      tags.forEach(tag=>{
        const row=document.createElement('div'); row.className='hh-row';
        const left=document.createElement('div'); left.className='hh-tag'; left.textContent=tag;
        const btn=document.createElement('button'); btn.className='hh-copy btn'; btn.textContent='Copy';
        btn.addEventListener('click', async()=>{ const old=btn.textContent; await copyText(tag); btn.textContent='Copied!'; setTimeout(()=>btn.textContent=old, 800); });
        row.appendChild(left); row.appendChild(btn); cont.appendChild(row);
      });
      results.appendChild(cont);
      if(copyAllBtn){ copyAllBtn.onclick = async()=>{ await copyText(tags.join(' ')); const old=copyAllBtn.textContent; copyAllBtn.textContent='Copied All!'; setTimeout(()=>copyAllBtn.textContent=old, 900); }; }
    }

    function onGenerate(){ render(generate(kw.value)); }
    btn.addEventListener('click', onGenerate);
    kw.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); onGenerate(); } });
  });
})();