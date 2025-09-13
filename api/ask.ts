// /api/ask.ts — Vercel serverless function
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { question, history = [] } = (req.body || {}) as { question?: string, history?: Array<{role: 'user'|'assistant'|'system', content: string}> };
    if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Missing question' });

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'You are HashHero’s helpful AMA assistant. Be concise, accurate, friendly, and honest about uncertainty.',
      input: [
        ...history.slice(-6),
        { role: 'user', content: question }
      ]
    });

    const text = (response as any).output_text || 'Sorry—I could not generate a reply.';
    res.status(200).json({ answer: text });
  } catch (err: any) {
    console.error('AMA error:', err);
    res.status(500).json({ error: 'Upstream error', detail: err?.message || 'unknown' });
  }
}
