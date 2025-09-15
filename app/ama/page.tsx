"use client";
import { useState } from "react";

export default function AMA() {
  const [q, setQ] = useState("");
  const [a, setA] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function ask() {
    setBusy(true);
    setErr(null);
    setA(null);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q.trim() }),
      });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(`HTTP ${r.status}: ${msg}`);
      }
      const text = await r.text();
      setA(text);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function health() {
    const r = await fetch("/api/ask", { method: "POST", headers: { "x-hashhero-health": "ping" }});
    alert(r.ok ? "API is up ✅" : `API down ❌ (${r.status})`);
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">HashHero AMA</h1>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask me anything…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          onClick={ask}
          disabled={busy || !q.trim()}
        >
          {busy ? "Thinking…" : "Ask"}
        </button>
        <button className="px-3 py-2 border rounded" onClick={health}>Health</button>
      </div>
      {err && <p className="text-red-600 text-sm">Error: {err}</p>}
      {a && (
        <section className="border rounded p-3 bg-gray-50 whitespace-pre-wrap">
          {a}
        </section>
      )}
    </main>
  );
}
