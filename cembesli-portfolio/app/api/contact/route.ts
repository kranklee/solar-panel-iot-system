// Validating contact endpoint with naive in memory token bucket rate limiting per IP
// Side effect free so deploys without an email provider configured still respond cleanly
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}

interface Bucket {
  tokens: number;
  updated: number;
}

const BUCKET = new Map<string, Bucket>();
const CAPACITY = 5;
const REFILL_PER_MINUTE = 5;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function consume(ip: string): boolean {
  const now = Date.now();
  const existing = BUCKET.get(ip);
  if (!existing) {
    BUCKET.set(ip, { tokens: CAPACITY - 1, updated: now });
    return true;
  }
  const elapsedMinutes = (now - existing.updated) / 60_000;
  const refilled = Math.min(CAPACITY, existing.tokens + elapsedMinutes * REFILL_PER_MINUTE);
  if (refilled < 1) {
    existing.tokens = refilled;
    existing.updated = now;
    return false;
  }
  existing.tokens = refilled - 1;
  existing.updated = now;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  if (!consume(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !isNonEmptyString(payload.name) ||
    !isNonEmptyString(payload.email) ||
    !isNonEmptyString(payload.message)
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
