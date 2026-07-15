// Card that surfaces unlockable achievements with progress bar and locked or unlocked states
// Subscribes to the AchievementsProvider so it animates in real time as visitors explore
'use client';

import { useTranslations } from 'next-intl';
import { useAchievements, type AchievementKey } from '@/components/providers/AchievementsProvider';
import { cn } from '@/lib/utils';

const KEYS: AchievementKey[] = [
  'explorer',
  'polyglot',
  'themeShifter',
  'pythonista',
  'gamer',
  'conqueror',
  'curious',
  'secret'
];

export function AchievementsCard() {
  const t = useTranslations('achievements');
  const { unlocked } = useAchievements();
  const earned = KEYS.filter((key) => unlocked.has(key)).length;
  const progress = (earned / KEYS.length) * 100;

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">
            {earned} / {KEYS.length}
          </p>
        </div>
        <span className="font-mono text-2xl font-semibold text-primary">{Math.round(progress)}%</span>
      </header>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <span
          className="block h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 grid flex-1 grid-cols-2 gap-2 text-xs">
        {KEYS.map((key) => {
          const isOn = unlocked.has(key);
          return (
            <li
              key={key}
              className={cn(
                'rounded-2xl border p-2.5 transition-colors',
                isOn
                  ? 'border-primary/50 bg-primary/10'
                  : 'bg-black/[0.02] dark:bg-white/[0.03] opacity-60'
              )}
            >
              <p className="flex items-center gap-1.5 font-semibold">
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-block h-2 w-2 rounded-full',
                    isOn ? 'bg-accent' : 'bg-foreground/30'
                  )}
                />
                {t(key)}
              </p>
              <p className="mt-0.5 text-[10px] text-foreground/60 dark:text-bg/60">
                {t(`${key}Desc` as const)}
              </p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
