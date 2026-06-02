// Plain text CV endpoint for curl friendly consumption
// Returns markdown by default and falls back to the PDF when requested via Accept header
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600;

const CV = `# Cem Besli
Software Engineer  ·  Based in Germany
cem@cembesli.com  ·  github.com/kranklee  ·  cembesli.com

## Summary
Software Engineering Technology graduate from Centennial College now based in
Germany. I build interactive, performant, and resilient software across the
stack. Comfortable in TypeScript, Next.js, React, Node, Python, and Postgres.

## Availability
Open to roles in Berlin, Munich, Cologne, and remote across the EU.
EU Blue Card eligible at the IT shortage threshold (Mangelberuf).

## Education
Centennial College, Toronto  ·  Software Engineering Technology  ·  2022 to 2026

## Selected Projects
Solar Panel IoT Monitoring System (2025)
  Python publisher and subscriber with paho-mqtt, weather aware simulator, tkinter dashboard.

cembesli.com Portfolio (2026)
  Next.js 14, TypeScript strict, Pyodide in browser, Supabase realtime leaderboard,
  three canvas games, AI assistant streaming from Claude Haiku 4.5, four locales.

## Stack
Languages   TypeScript, JavaScript, Python, Go, SQL, C#
Frameworks  Next.js, React, Node, Tailwind, FastAPI
Cloud       Vercel, Supabase, AWS, Cloudflare
Tools       Git, GitHub Actions, Docker, Playwright

## Languages
Turkish     Native
English     C1
German      B1 to B2
French      B1

## Contact
Email     cem@cembesli.com
GitHub    https://github.com/kranklee
LinkedIn  https://www.linkedin.com/in/cembesli
`;

export async function GET(request: NextRequest) {
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('application/pdf')) {
    const pdfUrl = new URL('/cv.pdf', request.url);
    return NextResponse.redirect(pdfUrl);
  }
  return new NextResponse(CV, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
