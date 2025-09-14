// app/api/ask/route.ts
import type { NextRequest } from "next/server";

export const runtime = "edge"; // Fast + cheaper on Vercel
export const preferredRegion = ["iad1", "arn1", "cdg1"]; // optional

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Basic health ping (useful for quick checks)
    if (req.headers.get("x-hashhero-health") === "ping") {
      return new Response("ok", { status: 200 });
    }

    const { question } = await req.json().catch(() => ({}));
    if (!question || typeof question !== "string") {
      return bad("Missing 'question' in JSON body");
    }

    // Toggle MOCK mode to isolate UI vs model issues without using keys.
    const MOCK = process.env.HASHHERO_MOCK === "1";

    // ——— MOCK MODE (guarantees a 200 to prove your wiring) ———
    if (MOCK) {
      const mock = `You asked: "${question}". This is a MOCK response from HashHero API.`;
      return new Response(mock, {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    // ——— LIVE MODE (OpenAI Responses API via fetch) ———
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return bad("Server missing OPENAI_API_KEY", 500);

    const model = process.env.HASHHERO_MODEL || "gpt-4o-mini"; // pick your default
    const sys = process.env.HASHHERO_SYSTEM_PROMPT || "You are a concise, helpful AMA assistant.";

    const body = {
      model,
      input: [
        { role: "system", content: sys },
        { role: "user", content: question },
      ],
      // text output (simple non-streamed for reliability)
      max_output_tokens: 600,
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errTxt = await r.text();
      return bad(`Upstream error: ${r.status} ${errTxt}`, 502);
    }

    const data = await r.json();
    // The Responses API returns text in data.output_text (concatenated convenience field).
    const text = data?.output_text ?? "No output_text returned.";

    return new Response(text, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (e: any) {
    return bad(`Server crashed: ${e?.message ?? String(e)}`, 500);
  }
}

export async function OPTIONS() {
  // Simple CORS preflight; keeps things happy if you ever call from another origin
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-hashhero-health",
      "access-control-max-age": "86400",
    },
  });
}
