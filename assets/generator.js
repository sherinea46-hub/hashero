
(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  ready(function(){
    // --- Element helpers
    const $ = (sel, ctx=document) => ctx.querySelector(sel);
    const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
    const byId = (id) => document.getElementById(id);

    // Mount points (tolerant lookups)
    const kw = byId('kw') || $('input#kw') || $('input[placeholder*="Topic" i]') || $('input');
    const genBtn = byId('generate') || $('#generate') || $('button#generate');
    const results = byId('results') || $('#results');
    const copyAllBtn = byId('copyAllBtn') || $('#copyAllBtn');
    const tabs = $$('.hh-tab');
    const aiInclude = byId('aiInclude'), aiAvoid = byId('aiAvoid');
    const lvIntensity = byId('lvIntensity'), lvTrend = byId('lvTrend'), lvNiche = byId('lvNiche');
    const lvMax = byId('lvMax'), lvCase = byId('lvCase'), lvRegion = byId('lvRegion');
    const lvShuffle = byId('lvShuffle'), lvSafe = byId('lvSafe');

    if(!results){ return; } // nothing to render into

    // --- Popularity baseline + helpers
    const POP = { "fyp":950000000,"viral":880000000,"trending":740000000,"love":2200000000,
                  "instagood":1500000000,"fashion":900000000,"youtube":600000000,
                  "shorts":700000000,"tiktok":1300000000 };
    function estPopularity(tag, platform){
      const key = String(tag||'').replace(/^#/,'').toLowerCase();
      const base = POP[key] || (Math.max(1, 12 - Math.min(key.length, 12)) * 1e6);
      const w = { tiktok:1.2, instagram:1.1, facebook:0.8, x:0.7, youtube:0.9 }[platform] || 1;
      return Math.round(base * w);
    }
    function nf(n){ return n.toLocaleString('en-US'); }

    // --- Rules
    const RULES = {
      tiktok:    { label:"TikTok",    maxTags: 5,  style: (t)=>t.map(x=>x.toLowerCase()) },
      instagram: { label:"Instagram", maxTags: 30, style: (t)=>t },
      facebook:  { label:"Facebook",  maxTags: 3,  style: (t)=>t },
      x:         { label:"X",         maxTags: 2,  style: (t)=>t.map(x=>x.replace(/[^a-z0-9#]/gi,'')) },
      youtube:   { label:"YouTube",   maxTags: 3,  style: (t)=>t }
    };
    let active = 'tiktok';

    // --- Utility
    function debounce(fn, ms){ let t; return function(){ clearTimeout(t); const args=arguments; t=setTimeout(()=>fn.apply(null, args), ms); }; }
    function norm(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
    function title(s){ return s.replace(/(^|\s)\S/g, t=>t.toUpperCase()); }

    // --- Keyword extraction & expansion
    const STOP = new Set(("a an the and or of to in on for with from by is are was were be been at as that this it your you our we i me my mine his her their they them he she do does did not no yes too very just much many more most less few over under again only own same so than then once each both any some such own other into out up down off above below why how all can will should could would might must may".split(" ")));
    function extractKeywords(txt){
      const words = norm(txt).split(' ').filter(Boolean).filter(w=>!STOP.has(w));
      const freq = new Map(); words.forEach(w=>freq.set(w, 1 + (freq.get(w)||0)));
      return Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([w])=>w);
    }
    const SYN = {
      "video":["clip","shorts","reel"],
      "tips":["hacks","guide","howto","protips"],
      "travel":["wander","adventure","trip","journey"],
      "food":["recipe","cooking","kitchen","yum"],
      "fitness":["workout","gym","health","wellness","fit"],
      "beauty":["makeup","skincare","glow"],
      "money":["finance","investing","budget","wealth"],
      "fashion":["style","outfit","ootd","trend"],
      "music":["song","beat","remix","cover","instrumental"]
    };
    function expandIdeas(keys, intensity=40, niche=30){
      const out = new Set(keys);
      const more = Math.round( (intensity/100) * 12 );
      keys.forEach(k=>{
        const base = k.toLowerCase();
        (SYN[base] || SYN[base.replace(/s$/,'')] || []).forEach(v=> out.add(v));
        if(base.length>3){ out.add(base+'tips'); out.add(base+'hacks'); }
      });
      const suffixes = ['life','vibes','journey','daily','zone','hub','nation','club','community'];
      for (let i=0;i<Math.round((niche/100)*suffixes.length);i++){
        keys.forEach(k=> out.add(k+suffixes[i]));
      }
      return Array.from(out).slice(0, Math.max(8, more));
    }
    function caseStyle(tag, mode){
      if(mode==='camel'){
        return tag.replace(/^#?/, '#').replace(/#?([a-z0-9]+)/i, (m)=>{
          const core = m.replace(/^#/,'');
          return '#'+core.replace(/(^|[\s_\-])\w/g, s=>s.replace(/[^a-z0-9]/i,'').toUpperCase());
        });
      }
      return tag.toLowerCase().startsWith('#') ? tag.toLowerCase() : '#'+tag.toLowerCase();
    }
    function buildBaseFromKeyword(k){
      const base = norm(k);
      if(!base) return [];
      const key = base.replace(/\s+/g,'');
      const K = title(base).split(' ').join('');
      const buckets = [
        { mix:['#%k','%k','%kTips','%kHacks','%kGuide','%kIdeas','%kPro'] },
        { mix:['%kForBeginners','%kForCreators','%k2025','%kDaily','%kNow'] },
        { mix:['viral','fyp','trending','explore','reels','shorts'] },
        { mix:['%kCommunity','%kLife','%kJourney','%kVibes','%kHub','%kNation','%kClub'] },
        { mix:['TikTok','InstaReels','YouTubeShorts','Shorts'] }
      ];
      const set = new Set();
      buckets.forEach(b=> b.mix.forEach(m=> set.add('#' + m.replace(/%k/g, K).replace(/[^A-Za-z0-9]/g,'')) ));
      set.add('#' + key);
      set.add('#' + K);
      return Array.from(set);
    }
    function addRegion(tags, regionRaw){
      const region = (regionRaw||'').trim();
      if(!region) return tags;
      const parts = region.split(',').map(s=>norm(s)).filter(Boolean);
      const out = new Set(tags);
      parts.forEach(p=> out.add('#'+p.replace(/\s+/g,'')));
      if(parts.length>=2){ out.add('#'+parts.map(p=>p.replace(/\s+/g,'')).join('')); }
      return Array.from(out);
    }
    function applyTrendBoost(tags, boost=50){
      const trending = ['#viral','#fyp','#trending','#explore','#reels','#shorts'];
      if(boost<=0) return tags;
      const n = Math.round((boost/100)*trending.length);
      const set = new Set(tags);
      trending.slice(0,n).forEach(t=> set.add(t));
      return Array.from(set);
    }
    const BAN = new Set(['#followforfollow','#likeforlike','#sub4sub','#spam','#nsfw','#adult']);
    function safeFilter(tags){ return tags.filter(t=> !BAN.has(t.toLowerCase())); }
    function applyGuidance(tags){
      const inc = (aiInclude && aiInclude.value || '').trim();
      const avoid = (aiAvoid && aiAvoid.value || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
      let list = tags.filter(t=>!avoid.some(a=>t.toLowerCase().includes(a)));
      if(inc){
        let t = inc.startsWith('#')?inc:('#'+inc.replace(/[^a-z0-9]/gi,''));
        if(!list.includes(t)) list.unshift(t);
      }
      return list;
    }
    function rankOrShuffle(tags){
      if(lvShuffle && lvShuffle.checked){
        const a = tags.slice();
        for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
        return a;
      }
      return tags.slice().sort((a,b)=> estPopularity(b, active) - estPopularity(a, active));
    }
    function applyCase(tags){
      const mode = (lvCase && lvCase.value) || 'lower';
      return tags.map(t=> caseStyle(t.replace(/^#/,'').replace(/[^A-Za-z0-9]/g,''), mode));
    }
    function capToMax(tags){
      const rule = RULES[active] || RULES.tiktok;
      const slider = parseInt((lvMax && lvMax.value) || '0', 10);
      const hardCap = slider>0 ? Math.min(slider, rule.maxTags) : rule.maxTags;
      return tags.slice(0, hardCap);
    }
    function buildPipeline(seed){
      let tags = buildBaseFromKeyword(seed);
      const keys = extractKeywords(seed);
      const intensity = parseInt((lvIntensity && lvIntensity.value) || '40',10);
      const niche     = parseInt((lvNiche && lvNiche.value) || '30',10);
      const expanded = expandIdeas(keys.concat((kw && kw.value || '').split(' ')).filter(Boolean), intensity, niche);
      const boosted = buildBaseFromKeyword(expanded.join(' '));
      tags = Array.from(new Set(tags.concat(boosted)));
      tags = addRegion(tags, (lvRegion && lvRegion.value) || '');
      const trend = parseInt((lvTrend && lvTrend.value) || '50',10);
      tags = applyTrendBoost(tags, trend);
      if(lvSafe && lvSafe.checked){ tags = safeFilter(tags); }
      tags = applyGuidance(tags);
      tags = applyCase(tags);
      tags = rankOrShuffle(tags);
      const rule = RULES[active] || RULES.tiktok;
      tags = rule.style(tags);
      tags = capToMax(tags);
      return tags;
    }
    function copyText(txt){
      return navigator.clipboard?.writeText(txt).catch(()=>{
        const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
      });
    }
    function render(tags){
      if(!results) return;
      results.innerHTML = '';
      const wrap = document.createElement('div');
      const rows = document.createElement('div'); rows.setAttribute('role','table');
      tags.forEach(tag=>{
        const row = document.createElement('div'); row.className='hh-row'; row.setAttribute('role','row');
        const tcell = document.createElement('div'); tcell.className='hh-tag'; tcell.textContent = tag; row.appendChild(tcell);
        const metric = document.createElement('div'); metric.className='hh-metric';
        metric.textContent = 'Popularity (est.): ' + nf(estPopularity(tag, active));
        row.appendChild(metric);
        const cbtn = document.createElement('button'); cbtn.className='hh-copy'; cbtn.textContent='Copy';
        cbtn.addEventListener('click', async ()=>{ await copyText(tag); const old=cbtn.textContent; cbtn.textContent='Copied!'; setTimeout(()=>cbtn.textContent=old, 900); });
        row.appendChild(cbtn);
        rows.appendChild(row);
      });
      wrap.appendChild(rows);
      results.appendChild(wrap);
      if(copyAllBtn){
        copyAllBtn.onclick = async ()=>{
          const blob = tags.join(' ');
          await copyText(blob);
          const old=copyAllBtn.textContent; copyAllBtn.textContent='Copied All!'; setTimeout(()=>copyAllBtn.textContent=old, 1000);
        };
      }
      if(results && kw){ results.dataset.lastKw = kw.value || ''; }
    }

    // --- Platform switching
    function setActive(p, el){
      active = (p==='youtube' ? 'youtube' : p);
      tabs.forEach(t=>{
        const is = (t===el);
        t.classList.toggle('active', is);
        t.setAttribute('aria-selected', is?'true':'false');
        t.tabIndex = is?0:-1;
      });
      const seed2 = (results && results.dataset && results.dataset.lastKw ? results.dataset.lastKw : (kw && kw.value ? kw.value : ''));
      if(seed2 && String(seed2).trim().length){ render(buildPipeline(seed2)); }
    }
    tabs.forEach(tab => {
      const plat = tab.dataset?.platform || tab.textContent.trim().toLowerCase();
      tab.addEventListener('click', () => {
        setActive(plat, tab);
      });
      tab.addEventListener('keydown', (e)=>{
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setActive(plat, tab); }
      });
    });

    // --- Actions
    function doGenerate(){ if(!kw) return; render(buildPipeline(kw.value||'')); }
    if(genBtn) genBtn.addEventListener('click', doGenerate);
    if(kw){
      kw.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); doGenerate(); } });
      const autoRender = debounce(()=>{
        const seed = kw.value.trim();
        if(seed){ render(buildPipeline(seed)); }
        else if(results){ results.innerHTML=''; results.dataset.lastKw=''; }
      }, 280);
      kw.addEventListener('input', autoRender);
    }
    if(aiInclude){ aiInclude.addEventListener('input', ()=>{ if(results?.dataset?.lastKw){ doGenerate(); } }); }
    if(aiAvoid){ aiAvoid.addEventListener('input', ()=>{ if(results?.dataset?.lastKw){ doGenerate(); } }); }

    // Init
    const firstTab = tabs[0]; if(firstTab){ setActive((firstTab.dataset?.platform || firstTab.textContent.trim().toLowerCase()), firstTab); }
  });
})();
