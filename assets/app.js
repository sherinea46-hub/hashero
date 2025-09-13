
window.__hashhero_loaded = true;
// Helpers
const $ = s=>document.querySelector(s);
const el=(t,c,tx)=>{const e=document.createElement(t); if(c) e.className=c; if(tx) e.textContent=tx; return e;};
const copy = async t => { try{ await navigator.clipboard.writeText(t); alert("Copied!"); }catch(e){ alert("Copy failed"); }};
const stop = new Set("a,an,the,and,or,if,of,in,on,for,to,with,by,at,from,this,that,these,those,as,be,is,are,was,were,am,will,can,how,what,when,where,why,who,your,my,our,their,it's,its,into,about,over,under,vs,via".split(","));
const uniq = a=>[...new Set(a)];
const tokens = s => (s||"").toLowerCase().replace(/[^a-z0-9\s\-]/g," ").split(/\s+/).filter(w=>w && !stop.has(w) && w.length>2);
const trending = ["viral","trending","fyp","foryou","explore","instadaily","reels","shorts","creator"];

// Tag synthesis
function synthesize(desc, {bias="mix", limit=25, platform="Instagram"}){
  const ks = uniq(tokens(desc));
  let pool = uniq([...ks]);
  // simple relateds
  if(ks.some(k=>["travel","paris","rome","europe","vlog","cinematic","broll","tokyo","cafe","food","recipe","streetfood"].includes(k))){
    pool = uniq([...pool, "travel","wanderlust","adventure","vlog","cinematic","itinerary","hiddenGems","foodie","streetfood","budgettravel"]);
  }
  if(bias==="trending"||bias==="mix") pool = uniq([...pool,...trending]);
  if(bias==="niche"||bias==="mix") pool = uniq([...pool,"microinfluencer","smallcreator","howto","beginners","tips"]);
  // rank
  const score = t=> (ks.some(k=>t.includes(k))?2:0) + (t.length<=12?1:0) + (trending.includes(t)?0.5:0);
  pool.sort((a,b)=>score(b)-score(a));
  const out = pool.map(t=>t.replace(/\s+/g,"")).filter(Boolean).slice(0,limit);
  return out;
}

// Render tags
function renderTags(list){
  const box = $("#tags"); if(!box) return;
  box.innerHTML="";
  if(!list.length){ box.innerHTML='<div class="kicker">No tags yet. Try a richer description.</div>'; return; }
  list.forEach(t=>{
    const chip = el("span","tag","#"+t);
    chip.title = "Click to copy";
    chip.addEventListener("click", ()=> navigator.clipboard.writeText("#"+t));
    box.appendChild(chip);
  });
}

// Save groups
function saveGroup(name, tags){
  const all = JSON.parse(localStorage.getItem("hashhero_groups")||"[]");
  const ex = all.find(x=>x.name===name);
  if(ex){ ex.tags=tags; ex.ts=Date.now(); } else { all.push({name, tags, ts:Date.now()}); }
  localStorage.setItem("hashhero_groups", JSON.stringify(all));
}

// Wire generator (if present)
document.addEventListener("DOMContentLoaded", ()=>{
  if($("#generate")){
    $("#generate").addEventListener("click", ()=>{
      const desc=$("#desc").value.trim();
      const platform=$("#platform").value;
      const bias=$("#bias").value;
      let limit=parseInt($("#limit").value||"25",10);
      const tags=synthesize(desc,{bias,limit,platform});
      window.__tags = tags;
      renderTags(tags);
    });
    $("#clear")?.addEventListener("click", ()=>{ $("#desc").value=""; $("#tags").innerHTML=""; });
    $("#copyAll")?.addEventListener("click", ()=>{
      const mode=$("#format").value; const list=window.__tags||[];
      const format = (l)=> mode==="plain"? l.join(" ") : mode==="comma"? l.map(x=>"#"+x).join(", ") : mode==="newline"? l.map(x=>"#"+x).join("\n") : l.map(x=>"#"+x).join(" ");
      if(!list.length) return alert("Nothing to copy yet.");
      copy(format(list));
    });
    $("#saveGroup")?.addEventListener("click", ()=>{
      const list=window.__tags||[]; if(!list.length) return alert("Generate tags first.");
      const name=$("#groupName").value.trim()||"hashhero_group";
      saveGroup(name, list);
      alert("Saved group '"+name+"'");
    });
  }

  // Captions
  if($("#capGen")){
    $("#capGen").addEventListener("click", ()=>{
      const prompt=$("#capPrompt").value.trim();
      const tone=$("#capTone").value;
      const ks=tokens(prompt); const ideas=[];
      const emoji = ["✨","🔥","🎬","📍","🍽️","🌆","💡","🎒","🧭"];
      for(let i=0;i<9;i++){
        const bits = ks.slice(0,3+(i%3)).map(s=>s[0].toUpperCase()+s.slice(1)).join(" · ");
        let s = tone==="Story/Hook" ? `Once upon a moment: ${bits}` :
                tone==="Tips/List" ? `Pro tips: ${bits}` : `${bits}`;
        ideas.push(`${s} ${emoji[i%emoji.length]}`.trim());
      }
      $("#capOut").innerHTML = ideas.map(x=>`<div class="tag copyCap" title="Click to copy">${x}</div>`).join("");
      document.querySelectorAll(".copyCap").forEach(chip=> chip.addEventListener("click", ()=> copy(chip.textContent)));
    });
  }

  // UTM
  if($("#utmBuild")){
    $("#utmBuild").addEventListener("click", ()=>{
      const base = $("#baseUrl").value.trim();
      if(!base) return alert("Base URL required");
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
    $("#copyUtm")?.addEventListener("click", ()=> copy($("#utmResult").value));
  }

  // Link-in-bio
  if($("#libAdd")){
    $("#libAdd").addEventListener("click", ()=>{
      const n=$("#libName").value.trim(), u=$("#libUrl").value.trim();
      if(!n||!u) return alert("Add both Label and URL");
      const row=document.createElement("div"); row.className="row";
      row.innerHTML=`<input class="input libName" value="${n}"/><input class="input libUrl" value="${u}"/><button class="btn secondary libDel">Delete</button>`;
      $("#libList").appendChild(row);
      row.querySelector(".libDel").addEventListener("click", ()=> row.remove());
      $("#libName").value=""; $("#libUrl").value="";
    });
    $("#libExport")?.addEventListener("click", ()=>{
      const title=$("#pageTitle").value.trim()||"My Links";
      const items=[...document.querySelectorAll("#libList .row")].map(r=>({name:r.querySelector(".libName").value,url:r.querySelector(".libUrl").value})).filter(x=>x.name&&x.url);
      if(!items.length) return alert("Add at least one link");
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:sans-serif;background:#0b0f19;color:#e6e9f5;padding:24px}a{display:block;background:#11162a;color:#e6e9f5;border:1px solid rgba(255,255,255,.12);padding:14px 16px;border-radius:12px;margin:10px 0;text-decoration:none}</style></head>
<body><h1>${title}</h1>${items.map(i=>`<a href="${i.url}" target="_blank">${i.name}</a>`).join("")}</body></html>`;
      const blob=new Blob([html],{type:"text/html"});
      const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="linkinbio.html"; a.click(); URL.revokeObjectURL(url);
    });
  }

  // Groups
  if($("#groupsList")){
    const render=()=>{
      const all=(JSON.parse(localStorage.getItem("hashhero_groups")||"[]")).sort((a,b)=>b.ts-a.ts);
      $("#groupsList").innerHTML=all.map(g=>`<tr><td>${g.name}</td><td>${g.tags.length}</td><td><button class="btn secondary load" data-n="${g.name}">Load</button> <button class="btn secondary del" data-n="${g.name}">Delete</button></td></tr>`).join("");
      document.querySelectorAll(".load").forEach(b=> b.addEventListener("click", ()=>{ localStorage.setItem("hashhero_active_group", b.dataset.n); alert("Loaded '"+b.dataset.n+"'"); }));
      document.querySelectorAll(".del").forEach(b=> b.addEventListener("click", ()=>{ 
        const all=JSON.parse(localStorage.getItem("hashhero_groups")||"[]");
        const i=all.findIndex(x=>x.name===b.dataset.n); if(i>=0){ all.splice(i,1); localStorage.setItem("hashhero_groups", JSON.stringify(all)); render(); }
      }));
    };
    render();
  }

  // Engagement Timer
  if($("#timerStart")){
    let t=null, remain=0;
    const show=()=> $("#timerDisp").textContent=new Date(remain*1000).toISOString().substring(14,19);
    $("#timerStart").addEventListener("click", ()=>{
      remain=parseInt($("#workMin").value||"25",10)*60;
      clearInterval(t); show();
      t=setInterval(()=>{ remain--; show(); if(remain<=0){ clearInterval(t); alert("Time! Engage for 5 minutes."); } },1000);
    });
    $("#timerStop").addEventListener("click", ()=> clearInterval(t));
  }

  // Hashtagify
  if($("#hashifyBtn")){
    $("#hashifyBtn").addEventListener("click", ()=>{
      const words=uniq(tokens($("#hashifyInput").value)).map(w=>"#"+w).join(" ");
      $("#hashifyOut").value=words;
    });
    $("#copyHashify")?.addEventListener("click", ()=> copy($("#hashifyOut").value));
  }

  // Analyzer
  if($("#analyzeBtn")){
    $("#analyzeBtn").addEventListener("click", ()=>{
      const words=tokens($("#analyzeInput").value);
      const freq={}; words.forEach(w=>freq[w]=(freq[w]||0)+1);
      const rows=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,120);
      $("#analyzeTable").innerHTML=rows.map(([w,c])=>`<tr><td>${w}</td><td>${c}</td></tr>`).join("");
    });
  }
});
