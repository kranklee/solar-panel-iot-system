// Edge route handler that proxies user questions to Anthropic with streaming
// Returns a clear unavailable response when ANTHROPIC_API_KEY is not configured
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an assistant embedded on the personal portfolio website of Cem Besli, a software engineer based in Germany.

About Cem Besli:
- Software Engineering Technology graduate from Centennial College in Toronto, Canada.
- Now based in Germany. Open to roles in Berlin, Munich, Cologne, and remote across the EU.
- Languages: English (C1), German (B1 to B2), French (B1), Turkish (native).
- Visa: Software engineering is a Mangelberuf in Germany so he is eligible for the EU Blue Card at the lower IT threshold.
- Email: cem@cembesli.com
- GitHub: github.com/kranklee
- Domain: cembesli.com

Engineering profile:
- Full stack developer building production grade interactive systems end to end.
- Strong with TypeScript, Next.js 14 App Router, React Server Components, Tailwind CSS, and Node.
- Comfortable in Python, especially for data simulation, IoT, and tooling.
- Built a Solar Panel IoT Monitoring System using MQTT publisher and subscriber pattern in Python, with simulated sensor data and a tkinter dashboard.
- Built this portfolio itself: Next.js 14, TypeScript strict mode, next intl with EN FR DE TR, Pyodide running inside a Web Worker, Supabase realtime leaderboard, three canvas games, a command palette, and an achievement system.
- Comfortable on Vercel Edge Runtime, Supabase Postgres, GitHub Actions CI.

Tone:
- Friendly, concise, professional.
- Speak in first person about Cem only when appropriate. Default to third person about him.
- Reply in the language of the question when possible.
- If asked something you do not know, say so honestly and suggest emailing Cem.
- Never invent employers, dates, or credentials.
- Avoid hyphens in visible text.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'unconfigured' }, { status: 503 });
  }

  let body: { messages?: Message[] };
  try {
    body = (await request.json()) as { messages?: Message[] };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const cleaned = messages
    .filter(
      (m): m is Message =>
        !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
    .slice(-12);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: cleaned
  });

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta' &&
            chunk.delta.text
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n[stream error: ${err instanceof Error ? err.message : 'unknown'}]`)
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(body$, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
