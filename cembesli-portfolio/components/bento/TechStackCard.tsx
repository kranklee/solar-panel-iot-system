// Visual grid of technology badges organized by category
// Color coded chips with hover lift to make the stack scannable at a glance
'use client';

import { useTranslations } from 'next-intl';

interface BadgeGroup {
  key: 'languages' | 'frameworks' | 'tools' | 'cloud';
  color: string;
  items: string[];
}

const GROUPS: BadgeGroup[] = [
  {
    key: 'languages',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    items: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'C#']
  },
  {
    key: 'frameworks',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    items: ['Next.js', 'React', 'Node.js', 'Tailwind', 'FastAPI', 'Express']
  },
  {
    key: 'tools',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    items: ['Git', 'GitHub Actions', 'Docker', 'Vite', 'Jest', 'Playwright']
  },
  {
    key: 'cloud',
    color: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
    items: ['Vercel', 'Supabase', 'AWS', 'Cloudflare', 'PostgreSQL', 'Redis']
  }
];

export function TechStackCard() {
  const t = useTranslations('stack');

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>
      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50 dark:text-bg/50">
              {t(group.key)}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-transform hover:-translate-y-0.5 ${group.color}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
