// /api/hashtags — serverless endpoint with platform bias
export default async function handler(req, res){
  try{
    if(req.method !== 'POST'){ return res.status(405).json({error:'Method not allowed'}); }
    const { text, n = 15, platform = 'auto' } = req.body || {};
    const clean = String(text || '').trim();
    if(!clean){ return res.status(200).json({ tags: [] }); }

    const RULES = {
      auto:      { max: 15, case: 'lower', season: ['viral','trending','explore'] },
      tiktok:    { max: 5,  case: 'lower', season: ['fyp','viral','trending','shorts'] },
      instagram: { max: 30, case: 'camel', season: ['explore','viral','reels'] },
      facebook:  { max: 3,  case: 'lower', season: ['viral'] },
      x:         { max: 2,  case: 'lower', season: ['trending'] },
      youtube:   { max: 3,  case: 'lower', season: ['shorts','trending'] }
    };
    const rule = RULES[platform] || RULES.auto;
    const STOP = new Set(("a an the and or of to in on for with from by is are was were be been at as that this it your you our we i me my mine his her their they them he she do does did not no yes too very just much many more most less few over under again only own same so than then once each both any some such own other into out up down off above below why how all can will should could would might must may".split(" ")));
    const norm = (s)=> (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
    const title = (s)=> s.replace(/(^|\s)\S/g, t=>t.toUpperCase());
    const uniq = (a)=> Array.from(new Set(a));
    const words = (s)=> norm(s).split(' ').filter(Boolean).filter(w=>!STOP.has(w));
    const AFF = {travel:["wander","trip","journey","adventure","explore"],vlog:["vlogger","dailyvlog","creatorlife","behindthescenes"],food:["recipe","cooking","kitchen","yum","foodie"],fitness:["workout","gym","health","wellness","fit"],beauty:["makeup","skincare","glow"],music:["song","beats","remix","cover"],tech:["gadgets","coding","developer","ai","startup"],gaming:["gamer","stream","eSports","play"]};

    function caseStyle(tag, mode){
      const core = tag.replace(/^#/,'').replace(/[^A-Za-z0-9]/g,'');
      if(mode==='camel'){ return '#'+core.replace(/(^|[\\s_\\-])\\w/g, s=>s.toUpperCase()); }
      return '#'+core.toLowerCase();
    }
    function localGenerate(input){
      const k = words(input); if(!k.length) return [];
      const keys = uniq(k).sort((a,b)=> b.length-a.length).slice(0,5);
      const set = new Set();
      keys.forEach(k => { set.add('#'+k); (AFF[k]||[]).forEach(a=> set.add('#'+a)); });
      for(let i=0;i<keys.length;i++){ for(let j=i+1;j<keys.length;j++){ set.add('#'+keys[i]+keys[j]); set.add('#'+title(keys[i])+title(keys[j])); } }
      const phrase = keys.join(' ');
      if(phrase){ set.add('#'+phrase.replace(/\\s+/g,'')); set.add('#'+title(phrase).replace(/\\s+/g,'')); }
      (rule.season||[]).forEach(t=> set.add('#'+t));
      let arr = Array.from(set).map(t=> caseStyle(t, rule.case));
      arr = Array.from(new Set(arr)).sort((a,b)=> a.length - b.length);
      return arr.slice(0, rule.max);
    }

    if(!process.env.OPENAI_API_KEY){
      return res.status(200).json({ tags: localGenerate(clean) });
    }

    const prompt = [
      { role: "system",
        content: "You are a hashtag generator. Return only JSON {\"tags\":[\"#tag1\",\"#tag2\",...]}. Keep tags concise (1–3 words), platform-appropriate, unique, and safe. Do not exceed the requested count. Use platform conventions: TikTok very short & punchy (5), Instagram up to 30, Facebook 3, X 2, YouTube 3. Prefer topical specificity over generic tags."
      },
      { role: "user",
        content: `Platform: ${platform}. Max: ${rule.max}. Description: ${clean}` }
    ];

    const payload = { model: "gpt-4o-mini", messages: prompt, temperature: 0.3 };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify(payload)
    });
    if(!r.ok){
      return res.status(200).json({ tags: localGenerate(clean), note: "ai_fallback" });
    }
    const j = await r.json();
    const msg = j.choices?.[0]?.message?.content || "";
    let tags = [];
    try{
      const jsonMatch = msg.match(/\\{[\\s\\S]*\\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : msg);
      if(Array.isArray(parsed.tags)) tags = parsed.tags;
    }catch(_){}
    if(!tags.length){ tags = localGenerate(clean); }
    tags = Array.from(new Set(tags.map(t=> (t||'').toString().trim()))).filter(Boolean).map(t=> t.startsWith('#')?t:('#'+t.replace(/[^A-Za-z0-9]/g,''))).slice(0, rule.max);
    return res.status(200).json({ tags });
  }catch(e){
    return res.status(200).json({ tags: [] });
  }
}
