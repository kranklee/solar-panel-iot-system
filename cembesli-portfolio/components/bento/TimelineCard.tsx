// Path and experience timeline with education and selected projects on a vertical rail
// Pure semantic markup so screen readers walk it in the right order
'use client';

import { useTranslations } from 'next-intl';

interface Entry {
  start: string;
  end: string | null;
  title: string;
  body: string;
  tag: 'education' | 'project';
}

const ENTRIES: Entry[] = [
  {
    start: '2022',
    end: null,
    title: 'Centennial College, Toronto',
    body: 'Software Engineering Technology, sixth semester. Studying systems, web, and applied AI.',
    tag: 'education'
  },
  {
    start: '2025',
    end: '2026',
    title: 'Solar Panel IoT Monitoring System',
    body: 'Python publisher and subscriber with MQTT, simulated sensors, and a tkinter dashboard.',
    tag: 'project'
  },
  {
    start: '2025',
    end: null,
    title: 'cembesli.com portfolio',
    body: 'Next.js 14, TypeScript strict, Supabase realtime, Pyodide in browser, three canvas games.',
    tag: 'project'
  }
];

const TAG_COLOR: Record<Entry['tag'], string> = {
  education: '#6366f1',
  project: '#34d399'
};

export function TimelineCard() {
  const t = useTranslations('timeline');
  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>

      <ol className="relative mt-5 flex-1 space-y-4 border-l pl-5">
        {ENTRIES.map((entry, index) => (
          <li key={`${entry.start}-${index}`} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[27px] mt-1.5 inline-block h-3 w-3 rounded-full border-2 border-bg dark:border-bg-dark"
              style={{ backgroundColor: TAG_COLOR[entry.tag] }}
            />
            <p className="text-xs font-mono uppercase tracking-widest text-foreground/50 dark:text-bg/50">
              {entry.start} <span aria-hidden="true">/</span> {entry.end ?? t('present')}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{entry.title}</p>
            <p className="text-xs text-foreground/70 dark:text-bg/70">{entry.body}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
