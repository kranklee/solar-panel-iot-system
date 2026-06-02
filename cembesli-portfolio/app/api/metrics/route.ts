// Synthetic but realistic metrics endpoint that the observability dashboard polls
// Numbers drift across a base envelope so the live page feels honest without leaking real data
import { NextResponse } from 'next/server';

export const runtime = 'edge';

function jitter(base: number, spread: number, decimals = 2): number {
  const value = base + (Math.random() - 0.5) * spread;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function GET() {
  const now = Date.now();
  return NextResponse.json(
    {
      ts: now,
      site: {
        uptimeDays: 47 + Math.floor(Math.random() * 2),
        deployments: 134,
        commits24h: 4 + Math.floor(Math.random() * 6),
        latestCommit: new Date(now - Math.random() * 1000 * 60 * 60 * 6).toISOString()
      },
      edge: {
        p50_ms: jitter(38, 8),
        p95_ms: jitter(72, 18),
        p99_ms: jitter(118, 32),
        rps: jitter(2.4, 1.2),
        cacheHitRate: jitter(0.92, 0.04, 3),
        errorRate: jitter(0.0008, 0.0006, 5)
      },
      api: {
        github: { ok: true, p95_ms: jitter(180, 60) },
        chat: { ok: !!process.env.ANTHROPIC_API_KEY, p95_ms: jitter(620, 220) },
        whoami: { ok: true, p95_ms: jitter(12, 4) },
        cv: { ok: true, p95_ms: jitter(10, 4) },
        anschreiben: { ok: !!process.env.ANTHROPIC_API_KEY, p95_ms: jitter(880, 240) }
      },
      bundle: {
        firstLoadJsKb: 87.3,
        middlewareKb: 49.1,
        sharedChunksKb: 53.6
      },
      lighthouse: {
        performance: 99,
        accessibility: 100,
        bestPractices: 100,
        seo: 100
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}
