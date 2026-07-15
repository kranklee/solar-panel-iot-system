// Edge route that generates a personalised German Anschreiben for a target company
// Uses Anthropic Claude when ANTHROPIC_API_KEY is set, otherwise falls back to a deterministic template
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse, type NextRequest } from 'next/server';
import { findCompany, defaultRoleFor } from '@/lib/anschreiben';

export const runtime = 'edge';

interface RequestBody {
  company?: string;
  role?: string;
  language?: 'de' | 'en';
}

function buildFallback(companyName: string, city: string, role: string, language: 'de' | 'en'): string {
  if (language === 'en') {
    return `Cem Besli
cem@cembesli.com
github.com/kranklee

${companyName}
${city}, Germany

Subject: Application as ${role}

Dear ${companyName} hiring team,

I am writing to apply for a ${role} position with ${companyName}. I just relocated to Germany after completing my Software Engineering Technology program at Centennial College in Toronto, and I am eligible for the EU Blue Card at the IT shortage threshold.

I build interactive, performant, and resilient software across the stack. I work daily in TypeScript, Next.js 14 with React Server Components, Node, and Postgres, with Python for data and IoT side. My portfolio at cembesli.com runs Pyodide in a Web Worker, streams from Supabase Realtime, and includes a chat assistant built on the Anthropic API. I work with Claude Code daily as part of my development workflow.

I would love to bring this combination of curiosity and shipping discipline to ${companyName}. I speak English at C1, German at B1 to B2 and pushing toward C1, plus French and Turkish.

Thank you for your time. I look forward to hearing from you.

Sincerely,
Cem Besli
`;
  }
  return `Cem Besli
cem@cembesli.com
github.com/kranklee

${companyName}
${city}, Deutschland

Betreff: Bewerbung als ${role}

Sehr geehrtes Team von ${companyName},

mit grossem Interesse bewerbe ich mich auf eine Position als ${role} bei ${companyName}. Ich bin nach dem Abschluss meines Studiums Software Engineering Technology am Centennial College in Toronto nach Deutschland gezogen und an der Mangelberuf Schwelle der EU Blue Card berechtigt.

Ich entwickle interaktive, performante und widerstandsfaehige Software ueber den gesamten Stack. Taeglich arbeite ich mit TypeScript, Next.js 14 mit React Server Components, Node und Postgres, fuer Daten und IoT auch mit Python. Mein Portfolio cembesli.com fuehrt Pyodide in einem Web Worker aus, abonniert Supabase Realtime und enthaelt einen Chat Assistenten auf Basis der Anthropic API. Claude Code ist Teil meines taeglichen Workflows.

Diese Kombination aus Neugier und Lieferdisziplin moechte ich gerne in ein Team bei ${companyName} einbringen. Meine Sprachen sind Englisch C1, Deutsch B1 bis B2 mit C1 als naechstem Ziel, dazu Franzoesisch und Tuerkisch.

Vielen Dank fuer Ihre Zeit. Ich freue mich auf Ihre Rueckmeldung.

Mit freundlichen Gruessen,
Cem Besli
`;
}

export async function POST(request: NextRequest) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slug = typeof body.company === 'string' ? body.company : '';
  const target = findCompany(slug);
  if (!target) {
    return NextResponse.json({ error: 'Unknown company' }, { status: 404 });
  }
  const role = typeof body.role === 'string' && body.role.trim() ? body.role.trim() : defaultRoleFor(target.focus);
  const language: 'de' | 'en' = body.language === 'en' ? 'en' : 'de';
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new NextResponse(buildFallback(target.name, target.city, role, language), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = `Schreibe ein professionelles ${language === 'de' ? 'deutsches' : 'englisches'} Anschreiben fuer Cem Besli, der sich bei ${target.name} in ${target.city} fuer eine Position als ${role} bewirbt.

Ueber Cem:
- Frischer Software Engineering Technology Absolvent von Centennial College Toronto
- Gerade nach Deutschland gezogen, EU Blue Card berechtigt zur IT Mangelberuf Schwelle
- Sprachen: Deutsch B1 bis B2, Englisch C1, Franzoesisch B1, Tuerkisch Muttersprache
- Tech Stack: TypeScript, Next.js 14, React Server Components, Node, Python, Postgres, Supabase
- Portfolio: cembesli.com, mit Pyodide im Web Worker, Supabase Realtime, KI Assistent ueber Anthropic API
- Nutzt Claude Code taeglich als Teil des Entwicklungs Workflows
- Hat Solar Panel IoT Monitoring System mit Python und MQTT gebaut

Ueber ${target.name}:
- Fokus: ${target.focus}
- Standort: ${target.city}
- Warum diese Firma: ${target.why}

Anforderungen:
- Format: Block, mit Absenderzeile oben, Empfaengeradresse, Betreffzeile, Anrede, drei bis vier Absaetze, Gruss
- Ton: Professionell aber nicht steif
- Keine Bindestriche oder Anglizismen ueberverwenden
- Ein Absatz pro Idee: Vorstellung, technische Kompetenz, Passung zur Firma, Abschluss
- Maximal 350 Woerter
- Direkt im fertigen Text ausgeben, keine Erklaerungen davor oder dahinter`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('\n')
      .trim();
    return new NextResponse(text || buildFallback(target.name, target.city, role, language), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch {
    return new NextResponse(buildFallback(target.name, target.city, role, language), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
