
// Utility helpers
const $ = sel => document.querySelector(sel);
const el = (tag, cls, text) => { const e=document.createElement(tag); if(cls) e.className=cls; if(text) e.textContent=text; return e; };
const copyText = async (text) => { try{ await navigator.clipboard.writeText(text); return true; }catch(e){ return false; } };

// Keyword extraction (very lightweight)
const stop = new Set("a,an,the,and,or,if,of,in,on,for,to,with,by,at,from,this,that,these,those,as,be,is,are,was,were,am,will,can,how,what,when,where,why,who,your,my,our,their,it's,its,into,about,over,under,vs,via".split(","));
function tokens(s){
  return (s||"").toLowerCase()
    .replace(/[^a-z0-9\s\-]/g," ")
    .split(/\s+/).filter(w=>w && !stop.has(w) && w.length>2);
}
function uniq(arr){ return [...new Set(arr)]; }
function title(s){ return s[0].toUpperCase()+s.slice(1); }

// Seed lexicons
const genericTrending = ["viral","trending","foryou","fyp","explore","new","instadaily","reels","shorts","tiktok","creator","content"];
const travelAddons = ["travel","wanderlust","adventure","vacation","explore","trip","guide","itinerary","budgettravel","hiddenGems","foodie","streetfood","citywalk","museum","sunset","architecture","local","vlog","cinematic"];
const videoAddons = ["broll","cinematic","editor","capcut","filmmaking","aesthetic","a-roll","behindthescenes","howto","tutorial"];
const foodAddons = ["food","recipe","homemade","delicious","yummy","dessert","healthy","quick","snack","chef","streetfood"];
const nicheBoosters = ["microinfluencer","smallcreator","community","tips","howto","beginner","starter","journey","diary","daily","today"];

function relatedFromTokens(ks){
  const rel = [];
  if(ks.some(k=>["travel","trip","paris","europe","tokyo","japan","cafe","café","london","europe"].includes(k))) rel.push(...travelAddons);
  if(ks.some(k=>["vlog","video","cinematic","broll"].includes(k))) rel.push(...videoAddons);
  if(ks.some(k=>["food","cafe","restaurant","cook","recipe","bake","streetfood"].includes(k))) rel.push(...foodAddons);
  return rel;
}

function synthesizeTags(desc, {bias="none", limit=25, platform="Instagram"}){
  const ks = uniq(tokens(desc));
  const base = [];
  // Make compound tags from tokens: city + topic, topic + format
  for(let i=0;i<ks.length;i++){
    for(let j=i+1;j<ks.length;j++){
      const a=ks[i], b=ks[j];
      if(a.length>2 && b.length>2){
        if(/[a-z]/.test(a) && /[a-z]/.test(b)){
          base.push(a+b[0].toUpperCase()+b.slice(1));
          base.push(b+a[0].toUpperCase()+a.slice(1));
        }
      }
    }
  }
  let pool = uniq([
    ...ks,
    ...relatedFromTokens(ks),
    ...base
  ]);
  if(bias==="trending") pool = uniq([...pool, ...genericTrending]);
  if(bias==="niche") pool = uniq([...pool, ...nicheBoosters]);
  if(bias==="mix") pool = uniq([...pool, ...genericTrending.slice(0,6), ...nicheBoosters.slice(0,6)]);

  // Platform constraints
  let maxDefault = 25;
  if(platform.includes("Instagram")) maxDefault = 25;
  if(platform.includes("TikTok")) maxDefault = 30;
  if(platform.includes("YouTube")) maxDefault = 15;
  if(platform.includes("X")) maxDefault = 8;

  limit = Math.min(limit||maxDefault, maxDefault);

  // Rank: simple score = presence of keywords + length heuristic
  const scores = {};
  for(const t of pool){
    let s = 0;
    for(const k of ks){ if(t.includes(k)) s+=2; }
    if(t.length<=14) s+=1;
    if(t.length<=9) s+=1;
    if(genericTrending.includes(t)) s+=0.5;
    scores[t]=s;
  }
  const ranked = pool.sort((a,b)=> (scores[b]??0)-(scores[a]??0)).slice(0, limit*2);

  // Normalize to hashtag style tokens (camelCase, no spaces)
  const norm = ranked.map(t => t.replace(/\s+/g,"").replace(/[^a-zA-Z0-9]/g,""));
  const unique = uniq(norm).filter(x=>x);

  // Ensure we keep some pure keywords if available
  const final = unique.slice(0, limit);
  return final;
}

function renderTags(list){
  const box = $("#tags");
  box.innerHTML = "";
  if(list.length===0){ box.innerHTML = '<div class="muted">No tags yet. Try typing a richer description.</div>'; return; }
  for(const t of list){
    const chip = el("span","tag");
    const hash = el("span","copy");
    hash.textContent = "#"+t;
    hash.title = "Click to copy this hashtag";
    hash.addEventListener("click", async ()=>{
      await copyText("#"+t);
      hash.textContent = "✓ #"+t;
      setTimeout(()=>{ hash.textContent = "#"+t }, 800);
    });
    chip.append(hash);
    $("#tags").append(chip);
  }
}

function getFormatted(list, mode="hash"){
  if(mode==="plain") return list.join(" ");
  if(mode==="comma") return list.map(x=>"#"+x).join(", ");
  if(mode==="newline") return list.map(x=>"#"+x).join("\n");
  return list.map(x=>"#"+x).join(" ");
}

let current = [];
function generateNow(){
  const desc = $("#desc").value.trim();
  const platform = $("#platform").value;
  const bias = $("#bias").value;
  let limit = parseInt($("#limit").value || "25",10);
  current = synthesizeTags(desc, {bias, limit, platform});
  renderTags(current);
}
function saveGroup(){
  const name = $("#groupName").value.trim() || "hashhero_group";
  if(current.length===0) return alert("Generate some hashtags first.");
  const payload = {
    name,
    tags: current,
    ts: Date.now()
  };
  const all = JSON.parse(localStorage.getItem("hashhero_groups")||"[]");
  const existing = all.find(x=>x.name===name);
  if(existing){ existing.tags = current; existing.ts = Date.now(); }
  else all.push(payload);
  localStorage.setItem("hashhero_groups", JSON.stringify(all));
  alert("Saved group '"+name+"' ("+current.length+" tags) to this browser.");
}

// Wire events if elements exist on this page
document.addEventListener("DOMContentLoaded", ()=>{
  if($("#generate")){
    $("#generate").addEventListener("click", generateNow);
    $("#clear").addEventListener("click", ()=>{ $("#desc").value=""; $("#tags").innerHTML=""; current=[]; });
    $("#copyAll").addEventListener("click", async ()=>{
      if(!current.length) return;
      const formatted = getFormatted(current, $("#format").value);
      const ok = await copyText(formatted);
      alert(ok? "All tags copied!" : "Copy failed.");
    });
    $("#saveGroup").addEventListener("click", saveGroup);
  }

  // UTM builder
  if($("#utmBuild")){
    $("#utmBuild").addEventListener("click", ()=>{
      const base = $("#baseUrl").value.trim();
      if(!base){ alert("Base URL required"); return; }
      const qs = new URLSearchParams({
        utm_source: $("#utm_source").value.trim(),
        utm_medium: $("#utm_medium").value.trim(),
        utm_campaign: $("#utm_campaign").value.trim(),
        utm_term: $("#utm_term").value.trim(),
        utm_content: $("#utm_content").value.trim()
      });
      const url = (base.includes("?")? base+"&" : base+"?")+qs.toString();
      $("#utmResult").value = url;
    });
    $("#copyUtm").addEventListener("click", async ()=>{
      await copyText($("#utmResult").value);
      alert("Copied!");
    });
  }

  // Caption ideas
  if($("#capGen")){
    $("#capGen").addEventListener("click", ()=>{
      const prompt = $("#capPrompt").value.trim();
      const tone = $("#capTone").value;
      const ks = uniq(tokens(prompt));
      const ideas = [];
      for(let i=0;i<6;i++){
        const bits = ks.slice(0,3+(i%3)).map(title);
        const emoji = ["✨","🔥","🎬","📍","🍽️","🌆","💡","🎒","🧭"][i%9];
        const style = tone==="Short & Punchy" ? "— "+emoji : (tone==="Story/Hook" ? "Once upon a moment: " : "");
        ideas.push(`${style}${bits.join(" · ")} ${emoji}`.trim());
      }
      $("#capOut").innerHTML = ideas.map(x=>`<div class="tag copyCap" title="Click to copy">${x}</div>`).join("");
      document.querySelectorAll(".copyCap").forEach(chip=>{
        chip.addEventListener("click", async ()=>{ await copyText(chip.textContent); chip.textContent="✓ Copied"; setTimeout(()=>chip.textContent=chip.title?chip.title:chip.textContent,700)});
      });
    });
  }

  // Link-in-Bio
  if($("#libAdd")){
    $("#libAdd").addEventListener("click", ()=>{
      const name = $("#libName").value.trim();
      const url = $("#libUrl").value.trim();
      if(!name || !url) return alert("Add both Label and URL.");
      const row = el("div","row");
      row.innerHTML = `<input class="input libName" value="${name}"/><input class="input libUrl" value="${url}"/><button class="btn secondary libDel">Delete</button>`;
      $("#libList").append(row);
      row.querySelector(".libDel").addEventListener("click", ()=> row.remove());
      $("#libName").value=""; $("#libUrl").value="";
    });
    $("#libExport").addEventListener("click", ()=>{
      const name = $("#pageTitle").value.trim() || "My Links";
      const rows = [...document.querySelectorAll("#libList .row")];
      const items = rows.map(r=>({name:r.querySelector(".libName").value, url:r.querySelector(".libUrl").value})).filter(x=>x.name && x.url);
      if(items.length===0) return alert("Add at least one link.");
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${name}</title>
<style>body{{font-family:sans-serif;background:#0b0f19;color:#e6e9f5;padding:24px}a{{display:block;background:#11162a;color:#e6e9f5;border:1px solid rgba(255,255,255,.12);padding:14px 16px;border-radius:12px;margin:10px 0;text-decoration:none}}</style></head>
<body><h1 style="margin:0 0 12px 0">{name}</h1>{links}</body></html>`
        .replace("{name}", name)
        .replace("{links}", items.map(i=>`<a href="${i.url}" target="_blank">${i.name}</a>`).join(""));
      const blob = new Blob([html], {type:"text/html"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "linkinbio.html";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Groups page
  if($("#groupsList")){
    function render(){
      const all = JSON.parse(localStorage.getItem("hashhero_groups")||"[]").sort((a,b)=>b.ts-a.ts);
      $("#groupsList").innerHTML = all.map(g=>`<tr><td>${g.name}</td><td>${g.tags.length}</td><td><button class="btn secondary load" data-name="${g.name}">Load</button> <button class="btn secondary del" data-name="${g.name}">Delete</button></td></tr>`).join("");
      document.querySelectorAll(".load").forEach(b=> b.addEventListener("click", ()=>{
        localStorage.setItem("hashhero_active_group", b.dataset.name);
        alert("Loaded '"+b.dataset.name+"'. Go to Hashtag Generator and click Generate to use.");
      }));
      document.querySelectorAll(".del").forEach(b=> b.addEventListener("click", ()=>{
        const all = JSON.parse(localStorage.getItem("hashhero_groups")||"[]");
        const idx = all.findIndex(x=>x.name===b.dataset.name);
        if(idx>=0){ all.splice(idx,1); localStorage.setItem("hashhero_groups", JSON.stringify(all)); render(); }
      }));
    }
    render();
  }

  // Engagement timer (simple Pomodoro)
  if($("#timerStart")){
    let timer=null, remaining=0;
    const disp = ()=> $("#timerDisp").textContent = new Date(remaining*1000).toISOString().substring(14,19);
    $("#timerStart").addEventListener("click", ()=>{
      remaining = parseInt($("#workMin").value,10)*60;
      clearInterval(timer);
      disp();
      timer = setInterval(()=>{ remaining--; disp(); if(remaining<=0){ clearInterval(timer); alert("Time! Engage: comment/like/respond for 5 minutes."); } }, 1000);
    });
    $("#timerStop").addEventListener("click", ()=>{ clearInterval(timer); });
  }

  // Hashtagify
  if($("#hashifyBtn")){
    $("#hashifyBtn").addEventListener("click", ()=>{
      const txt = $("#hashifyInput").value;
      const words = uniq(tokens(txt));
      const tags = words.map(w=>"#"+w).join(" ");
      $("#hashifyOut").value = tags;
    });
    $("#copyHashify").addEventListener("click", async ()=>{
      await copyText($("#hashifyOut").value);
      alert("Copied!");
    });
  }

  // Analyzer
  if($("#analyzeBtn")){
    $("#analyzeBtn").addEventListener("click", ()=>{
      const txt = $("#analyzeInput").value.toLowerCase();
      const words = tokens(txt);
      const freq = {};
      for(const w of words){ freq[w]=(freq[w]||0)+1; }
      const rows = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,100);
      $("#analyzeTable").innerHTML = rows.map(([w,c])=>`<tr><td>${w}</td><td>${c}</td></tr>`).join("");
    });
  }
});
