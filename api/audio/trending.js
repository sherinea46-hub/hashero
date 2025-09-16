export const config = { runtime: 'edge' };

/**
 * /api/audio/trending
 * Returns a JSON array of { title, platform, tags, volume }.
 * Tries public sources (placeholders) with tight timeouts, then falls back to curated list.
 * CORS-enabled for same-site use.
 */
async function withTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  ]);
}

function dayIndex(len){
  const now = new Date();
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceEpoch = Math.floor(utcMidnight / 86400000);
  return len ? daysSinceEpoch % len : 0;
}

function rotate(arr){
  if (!arr || !arr.length) return [];
  const idx = dayIndex(arr.length);
  return arr.slice(idx).concat(arr.slice(0, idx));
}

const CURATED = [
  { title: "city pop sunset (instrumental)", platform: "Reels", tags: ["travel","aesthetic","vlog"], volume: "Medium" },
  { title: "lofi café rain loop", platform: "Reels", tags: ["coffee","study","cozy"], volume: "Medium" },
  { title: "phonk sprint edit", platform: "TikTok", tags: ["gym","motivation","workout"], volume: "High" },
  { title: "afrobeats chill groove", platform: "TikTok", tags: ["dance","summer","travel"], volume: "High" },
  { title: "cinematic whoosh + riser", platform: "Shorts", tags: ["transitions","b-roll","edits"], volume: "Niche" },
  { title: "uk drill piano loop", platform: "TikTok", tags: ["street","fashion","edits"], volume: "Medium" },
  { title: "bedroom pop hook", platform: "Reels", tags: ["day-in-the-life","grwm","vlog"], volume: "High" },
  { title: "retro synthwave drive", platform: "Shorts", tags: ["gaming","tech","timelapse"], volume: "Medium" },
  { title: "acoustic fingerstyle vibe", platform: "Reels", tags: ["nature","travel","cinematic"], volume: "Niche" },
  { title: "latin pop upbeat 110bpm", platform: "TikTok", tags: ["dance","food","couples"], volume: "High" }
];

async function fetchCandidate(url, mapFn) {
  const res = await withTimeout(fetch(url, { headers: { 'accept': 'application/json, text/html;q=0.9' } }), 2500);
  if (!res.ok) throw new Error('bad_status');
  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.includes('application/json')) data = await res.json();
  else data = await res.text();
  const items = mapFn(data);
  if (!Array.isArray(items) || !items.length) throw new Error('empty');
  return items;
}

// Placeholder mappers: These are stubs you can customize with real sources later.
function mapExampleJSON(json) {
  // expects [{name, platform, tags, volume}]
  try {
    return (json.items || []).slice(0, 20).map(x => ({
      title: x.name, platform: x.platform || 'TikTok', tags: x.tags || [], volume: x.volume || 'Medium'
    }));
  } catch { return []; }
}

function mapExampleHTML(html) {
  // naive extraction demo (kept simple to avoid fragility)
  const matches = [...html.matchAll(/data-audio-title="([^"]+)"/g)].slice(0, 15);
  return matches.map(m => ({ title: m[1], platform: 'TikTok', tags: [], volume: 'Medium' }));
}

async function getLive() {
  const candidates = [];
  try {
    // Example public JSON endpoint (replace with a real one later if you like)
    // candidates.push(...await fetchCandidate('https://example.com/trending.json', mapExampleJSON));
  } catch {}
  try {
    // Example HTML source (replace with a real one later); basic scraping demo
    // candidates.push(...await fetchCandidate('https://example.com/trending.html', mapExampleHTML));
  } catch {}
  return candidates;
}

export default async function handler(req) {
  let list = [];
  try {
    list = await getLive();
  } catch { list = []; }

  if (!list.length) {
    list = rotate(CURATED);
  }

  const res = new Response(JSON.stringify(list), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // CORS for same origin; tweak if you want to open it up
      'access-control-allow-origin': req.headers.get('origin') || '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'cache-control': 'no-store'
    }
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: res.headers });
  }
  return res;
}
