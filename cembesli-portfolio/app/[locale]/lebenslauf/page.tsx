// German style Lebenslauf with photo placeholder, tabular dates, and CEFR language levels
// Print stylesheet hides the rest of the site chrome so a Cmd P export looks like a proper CV
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';

interface Section {
  title: string;
  rows: { left: string; right: string }[];
}

const PERSONAL: { label: string; value: string }[] = [
  { label: 'Name', value: 'Cem Besli' },
  { label: 'Nationalitaet', value: 'Tuerkisch' },
  { label: 'Wohnort', value: 'Deutschland' },
  { label: 'E Mail', value: 'cem@cembesli.com' },
  { label: 'GitHub', value: 'github.com/kranklee' },
  { label: 'LinkedIn', value: 'linkedin.com/in/cembesli' },
  { label: 'Website', value: 'cembesli.com' }
];

const SECTIONS: Section[] = [
  {
    title: 'Berufsprofil',
    rows: [
      {
        left: 'Heute',
        right:
          'Software Ingenieur mit Schwerpunkt auf interaktiven, performanten und skalierbaren Webanwendungen. Schwerpunkte sind TypeScript, Next.js 14, React Server Components, Tailwind CSS, Node und Postgres. Erfahren in Echtzeitsystemen, Edge Deployments und der Integration von LLM Funktionen.'
      }
    ]
  },
  {
    title: 'Bildung',
    rows: [
      {
        left: '09.2022 – 04.2026',
        right:
          'Centennial College, Toronto, Kanada · Software Engineering Technology · Schwerpunkte: Systems, Web, Applied AI'
      }
    ]
  },
  {
    title: 'Ausgewaehlte Projekte',
    rows: [
      {
        left: '01.2026 – heute',
        right:
          'cembesli.com Portfolio · Next.js 14, TypeScript strict, Pyodide im Web Worker, Supabase Realtime, Anthropic Claude Streaming, vier Sprachen, vollstaendiger Edge Build, GitHub Actions CI.'
      },
      {
        left: '09.2025 – 04.2026',
        right:
          'Solar Panel IoT Monitoring System · Python Publisher und Subscriber mit paho mqtt, wetterabhaengiger Simulator, Tkinter Dashboard, gemeinsames JSON Schema, gepruefte Tests.'
      }
    ]
  },
  {
    title: 'Technische Faehigkeiten',
    rows: [
      { left: 'Sprachen', right: 'TypeScript, JavaScript, Python, Go, SQL, C#' },
      { left: 'Frameworks', right: 'Next.js, React, Node, Tailwind, FastAPI, Express' },
      { left: 'Datenbanken', right: 'PostgreSQL, Supabase, Redis' },
      { left: 'Cloud', right: 'Vercel Edge, AWS, Cloudflare' },
      { left: 'Tools', right: 'Git, GitHub Actions, Docker, Playwright, Pyodide' },
      {
        left: 'KI Workflow',
        right: 'Anthropic Claude API, Prompt Engineering, agentenbasierte Entwicklung mit Claude Code'
      }
    ]
  },
  {
    title: 'Sprachkenntnisse',
    rows: [
      { left: 'Tuerkisch', right: 'Muttersprache · C2' },
      { left: 'Englisch', right: 'Verhandlungssicher · C1' },
      { left: 'Deutsch', right: 'Mittelstufe · B1 bis B2' },
      { left: 'Franzoesisch', right: 'Grundkenntnisse · B1' }
    ]
  },
  {
    title: 'Verfuegbarkeit',
    rows: [
      {
        left: 'Standort',
        right: 'Deutschland · offen fuer Berlin, Muenchen, Koeln und Remote in der EU'
      },
      {
        left: 'Visum',
        right: 'EU Blue Card berechtigt zur IT Mangelberuf Schwelle'
      },
      { left: 'Start', right: 'Sofort verfuegbar' }
    ]
  }
];

export default function LebenslaufPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <article className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Lebenslauf
        </p>
        <div className="flex gap-2">
          <a href="/api/cv" className="btn-ghost text-xs">
            Plain text
          </a>
          <a href="/cv.pdf" download className="btn-primary text-xs">
            PDF herunterladen
          </a>
        </div>
      </div>

      <div className="rounded-card border bg-card p-8 shadow-card dark:bg-card-dark print:rounded-none print:border-0 print:shadow-none">
        <header className="flex flex-col gap-6 border-b pb-6 sm:flex-row sm:items-start">
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md border bg-black/5 dark:bg-white/5">
            <Image
              src="/icon-192.svg"
              alt="Cem Besli portrait placeholder"
              fill
              sizes="96px"
              className="object-contain p-3"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold sm:text-4xl">Cem Besli</h1>
            <p className="text-foreground/70 dark:text-bg/70">
              Software Ingenieur · Systems Builder und Full Stack Entwickler
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-[8rem_1fr]">
              {PERSONAL.map((item) => (
                <div key={item.label} className="contents">
                  <dt className="font-semibold uppercase tracking-wider text-foreground/50 dark:text-bg/50">
                    {item.label}
                  </dt>
                  <dd className="text-foreground/85 dark:text-bg/85">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {SECTIONS.map((section) => (
          <section key={section.title} className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              {section.title}
            </h2>
            <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
              {section.rows.map((row) => (
                <div key={row.left + row.right} className="contents">
                  <dt className="font-mono text-xs uppercase tracking-wide text-foreground/55 dark:text-bg/55">
                    {row.left}
                  </dt>
                  <dd className="text-foreground/90 dark:text-bg/90">{row.right}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <footer className="mt-8 flex items-center justify-between border-t pt-4 text-xs text-foreground/55 dark:text-bg/55">
          <span>Stand: {today}</span>
          <span>Cem Besli</span>
        </footer>
      </div>
    </article>
  );
}
