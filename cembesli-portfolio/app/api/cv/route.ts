// Plain text CV endpoint for curl friendly consumption
// Returns markdown by default and falls back to the PDF when requested via Accept header
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600;

const CV = `# Cem Besli
Software Engineer  ·  Ottawa, Ontario, Canada
cem@cembesli.com  ·  github.com/kranklee  ·  cembesli.com

## Summary
Sixth semester Software Engineering Technology student at Centennial College.
I build interactive, performant, and resilient software across the stack.
Comfortable in TypeScript, Next.js, React, Node, Python, and Postgres.

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

## Languages spoken
English, French, German, Turkish

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
