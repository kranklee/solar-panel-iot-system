// Visual grid of technology proficiencies organised by category with years and frequency
// Each badge shows the tool, years of use, and how often it shows up in current work
'use client';

import { useTranslations } from 'next-intl';

type Frequency = 'daily' | 'weekly' | 'monthly';

interface Skill {
  name: string;
  years: number;
  frequency: Frequency;
}

interface BadgeGroup {
  key: 'languages' | 'frameworks' | 'tools' | 'cloud';
  color: string;
  items: Skill[];
}

const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly'
};

const GROUPS: BadgeGroup[] = [
  {
    key: 'languages',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    items: [
      { name: 'TypeScript', years: 3, frequency: 'daily' },
      { name: 'JavaScript', years: 4, frequency: 'daily' },
      { name: 'Python', years: 4, frequency: 'weekly' },
      { name: 'SQL', years: 3, frequency: 'weekly' },
      { name: 'Go', years: 1, frequency: 'monthly' },
      { name: 'C#', years: 2, frequency: 'monthly' }
    ]
  },
  {
    key: 'frameworks',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    items: [
      { name: 'Next.js 14', years: 2, frequency: 'daily' },
      { name: 'React', years: 3, frequency: 'daily' },
      { name: 'Node.js', years: 3, frequency: 'daily' },
      { name: 'Tailwind', years: 3, frequency: 'daily' },
      { name: 'FastAPI', years: 1, frequency: 'monthly' }
    ]
  },
  {
    key: 'tools',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    items: [
      { name: 'Git', years: 4, frequency: 'daily' },
      { name: 'GitHub Actions', years: 2, frequency: 'weekly' },
      { name: 'Docker', years: 2, frequency: 'weekly' },
      { name: 'Claude Code', years: 1, frequency: 'daily' },
      { name: 'Playwright', years: 1, frequency: 'monthly' }
    ]
  },
  {
    key: 'cloud',
    color: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
    items: [
      { name: 'Vercel', years: 2, frequency: 'daily' },
      { name: 'Supabase', years: 2, frequency: 'weekly' },
      { name: 'PostgreSQL', years: 3, frequency: 'weekly' },
      { name: 'Cloudflare', years: 2, frequency: 'monthly' },
      { name: 'AWS', years: 1, frequency: 'monthly' }
    ]
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
              {group.items.map((skill) => (
                <li
                  key={skill.name}
                  title={`${skill.name} · ${skill.years} years · ${FREQUENCY_LABEL[skill.frequency]}`}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-transform hover:-translate-y-0.5 ${group.color}`}
                >
                  <span>{skill.name}</span>
                  <span className="font-mono text-[10px] opacity-70">{skill.years}y</span>
                  <span className="font-mono text-[10px] opacity-70">·</span>
                  <span className="font-mono text-[10px] opacity-70">{FREQUENCY_LABEL[skill.frequency]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
