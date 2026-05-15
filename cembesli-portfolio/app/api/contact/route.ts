// Minimal contact endpoint that validates payload shape and echoes a confirmation
// Kept side effect free so the deploy works without an email provider configured
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
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
