/* ============== SMART HASHTAG GENERATOR ============== */
const STOP = new Set(["the","a","an","and","or","to","for","with","on","in","at","of","my","our","your",
"this","that","is","are","be","from","by","it","as","about","into","over","up","down","out"]);
const GENERIC = new Set(["love","instagood","photooftheday","beautiful","happy","cute","tbt","fashion",
"follow","followme","picoftheday","art","selfie","summer","instadaily","friends","repost","nature","girl",
"fun","style","smile","food","travel","life","like4like","fitness","beauty","music","sunset"]); // filtered

const PLATFORM_PREFIX = {
  Instagram: ["reels","instareels","explorepage","igers"],
  TikTok: ["fyp","foryou","tiktok","tiktokviral"],
  Twitter: ["tweet","x","threads"],
  YouTube: ["shorts","youtube","youtubeshorts"],
  LinkedIn: ["linkedin","career","professional","marketing","personalbrand"]
};
const BIAS = {
  balanced: { broad: 0.5, niche: 0.5 },
  reach: { broad: 0.8, niche: 0.2 },
  niche: { broad: 0.2, niche: 0.8 }
};
const SUGGESTIONS_STARTER = [
  "travel", "food", "fitness", "beginner", "photography", "sunset", "tutorial", "vlog",
  "cinematic", "paris", "tokyo", "newyork", "budget", "behindthescenes", "tips", "guide"
];

const stem = w => w.replace(/[^a-z0-9]+/gi,"").toLowerCase();

function suggestFromDesc(desc) {
  const words = desc.split(/[\s,./]+/).map(stem).filter(Boolean);
  const tokens = [];
  for (const w of words) {
    if (STOP.has(w) || w.length < 3) continue;
    if (/^\d+$/.test(w)) continue;
    tokens.push(w);
  }
  const enriched = new Set(tokens);
  for (const w of tokens) {
    if (w.endsWith("ing")) enriched.add(w.replace(/ing$/,""));
    if (w.endsWith("s")) enriched.add(w.replace(/s$/,""));
  }
  return Array.from(enriched);
}

function scoreTags(candidates, platform, biasMode){
  const out = [];
  const pref = PLATFORM_PREFIX[platform] || [];
  const {broad, niche} = BIAS[biasMode] || BIAS.balanced;

  for (const c of candidates) {
    if (!c) continue;
    if (GENERIC.has(c)) continue;
    const isBroad = (c.length <= 6) || ["travel","food","fitness","vlog","music","fun","tips"].includes(c);
    let s = 1;
    s += pref.includes(c) ? 3 : 0;
    s += isBroad ? (2*broad) : (2*niche);
    s += c.length <= 10 ? 0.2 : 0;
    out.push({tag:c, score:s});
  }
  const seen = new Set(); const uniq = [];
  for (const t of out.sort((a,b)=>b.score-a.score)){
    if (seen.has(t.tag)) continue;
    seen.add(t.tag);
    uniq.push(t);
  }
  return uniq.map(x=>x.tag);
}

function buildCandidates(desc, platform){
  const base = suggestFromDesc(desc);
  const pref = PLATFORM_PREFIX[platform] || [];
  const extras = [];
  for (const w of base){
    if (["paris","tokyo","london","newyork"].includes(w)) extras.push("cityguide","coffeelover");
    if (["cinematic","broll","b-roll"].includes(w)) extras.push("filmmaking","colorgrading");
    if (["vlog","travel"].includes(w)) extras.push("traveltips","hiddengems");
    if (["tutorial","guide","tips"].includes(w)) extras.push("howto","learn");
  }
  return [...base, ...pref, ...extras];
}

function renderChips(suggestions){
  const bar = document.getElementById("g-suggestions");
  bar.innerHTML = "";
  suggestions.slice(0,16).forEach(s=>{
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = s;
    chip.onclick = () => {
      const ta = document.getElementById("g-desc");
      ta.value = ta.value ? `${ta.value} ${s}` : s;
    };
    bar.appendChild(chip);
  });
}

function makeHashtags(){
  const desc = document.getElementById("g-desc").value.trim();
  const platform = document.getElementById("g-platform").value;
  const bias = document.getElementById("g-bias").value;
  const max = Math.max(5, Math.min(30, +document.getElementById("g-max").value || 25));
  document.getElementById("g-maxcap").textContent = max;

  const base = buildCandidates(desc, platform);
  const ordered = scoreTags(base, platform, bias);
  const tags = ordered
    .filter(t=>t.length <= 24)
    .slice(0, max)
    .map(t=>`#${t.replace(/\s+/g,"")}`);

  document.getElementById("g-out").value = tags.join(" ");
  document.getElementById("g-count").textContent = String(tags.length);
  const filtered = base.filter(x=>GENERIC.has(x));
  document.getElementById("g-warnings").textContent =
    filtered.length ? `Filtered ${filtered.length} generic tags.` : "";
}

function initGenerator(){
  renderChips(SUGGESTIONS_STARTER);
  document.getElementById("g-generate").onclick = makeHashtags;
  document.getElementById("g-clear").onclick = ()=>{
    document.getElementById("g-desc").value="";
    document.getElementById("g-out").value="";
    document.getElementById("g-count").textContent="0";
    document.getElementById("g-warnings").textContent="";
  };
  document.getElementById("g-copy").onclick = async ()=>{
    const v = document.getElementById("g-out").value;
    if (!v.trim()) return;
    await navigator.clipboard.writeText(v);
    document.getElementById("g-warnings").textContent = "Copied ✅";
    setTimeout(()=>document.getElementById("g-warnings").textContent="",1500);
  };
}

/* ============== AMA ============== */
function initAMA(){
  const q = document.getElementById("a-q");
  const out = document.getElementById("a-out");
  const ask = async ()=>{
    out.textContent = "…thinking";
    try{
      const r = await fetch("/api/ask", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body: JSON.stringify({ question: q.value.trim() })
      });
      out.textContent = await r.text();
    }catch(e){ out.textContent = "⚠️ Error. Try again."; }
  };
  document.getElementById("a-ask").onclick = ask;
  q.addEventListener("keydown", e=>{ if(e.key==="Enter") ask(); });
  document.getElementById("a-health").onclick = async ()=>{
    const r = await fetch("/api/ask", { method:"POST", headers:{ "x-hashhero-health":"ping" } });
    alert(r.ok ? "API is up ✅" : `API down ❌ (${r.status})`);
  };
}

/* ============== QR ============== */
function presetUrl(kind, raw){
  const v = raw.trim();
  if (!v) return "";
  switch(kind){
    case "ig": return v.startsWith("http") ? v : `https://instagram.com/${v.replace(/^@/,"")}`;
    case "tt": return v.startsWith("http") ? v : `https://tiktok.com/@${v.replace(/^@/,"")}`;
    case "yt": return v.startsWith("http") ? v : `https://youtube.com/${v}`;
    case "ln": return v.startsWith("http") ? v : `https://www.linkedin.com/in/${v.replace(/^@/,"")}`;
    default: return v;
  }
}
function initQR(){
  const dataI = document.getElementById("qr-data");
  const preset = document.getElementById("qr-preset");
  const size = document.getElementById("qr-size");
  const margin = document.getElementById("qr-margin");
  const img = document.getElementById("qr-img");

  const make = ()=>{
    const url = presetUrl(preset.value, dataI.value);
    if (!url){ img.src=""; return; }
    const s = size.value, m = margin.value;
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&margin=${m}&data=${encodeURIComponent(url)}`;
  };
  document.getElementById("qr-make").onclick = make;
  document.getElementById("qr-dl").onclick = ()=>{
    if (!img.src) return;
    const a = document.createElement("a");
    a.href = img.src; a.download = "hashhero-qr.png"; a.click();
  };
}

/* ============== TIMER ============== */
let tInterval=null, tTotal=0, tRemain=0, tPhase="work", tCycles=0, tCyclesLeft=0;
function setRing(p){
  const CIRC = 339.292;
  document.getElementById("t-ring").style.strokeDashoffset = String(CIRC*(1-p));
}
function format(ms){
  const s = Math.max(0, Math.round(ms/1000));
  const m = Math.floor(s/60), ss = s%60;
  return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}
function tick(){
  tRemain = Math.max(0, tRemain - 1000);
  const p = 1 - (tRemain / tTotal);
  setRing(p);
  document.getElementById("t-clock").textContent = format(tRemain);
  if (tRemain <= 0){
    document.getElementById("t-beep").play().catch(()=>{});
    nextPhase();
  }
}
function nextPhase(){
  if (tPhase==="work"){
    if (tCyclesLeft<=0){ stopTimer(); document.getElementById("t-status").textContent="Done ✅"; return; }
    tPhase="break";
    const mins = +document.getElementById("t-break").value||5;
    startPhase(mins, "Break");
  }else{
    tPhase="work"; tCyclesLeft--;
    const mins = +document.getElementById("t-work").value||20;
    startPhase(mins, `Work (left ${tCyclesLeft})`);
  }
}
function startPhase(mins, label){
  tTotal = mins*60*1000; tRemain = tTotal; setRing(0);
  document.getElementById("t-status").textContent = label;
}
function startTimer(){
  tCycles = +document.getElementById("t-cycles").value||3;
  tCyclesLeft = tCycles;
  tPhase="work";
  startPhase(+document.getElementById("t-work").value||20, `Work (left ${tCyclesLeft})`);
  clearInterval(tInterval); tInterval = setInterval(tick, 1000);
}
function stopTimer(){ clearInterval(tInterval); tInterval=null; }

function initTimer(){
  document.getElementById("t-start").onclick = startTimer;
  document.getElementById("t-stop").onclick = ()=>{ stopTimer(); document.getElementById("t-status").textContent="Stopped"; };
}

document.addEventListener("DOMContentLoaded", ()=>{
  initGenerator(); initAMA(); initQR(); initTimer();
});
