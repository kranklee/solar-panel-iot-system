// Server rendered GitHub style contribution heatmap built from synthesized weekly cells
// Could be wired to the real GitHub GraphQL ContributionsCollection by adding a token scoped fetch
import { getTranslations } from 'next-intl/server';

function deterministicCount(date: Date): number {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    if (Math.sin(date.getTime() / 36e7) > 0.6) return 6;
    return 1 + Math.floor((Math.cos(date.getTime() / 21e7) + 1) * 2);
  }
  const base = 3 + Math.floor((Math.sin(date.getTime() / 36e6) + 1) * 4);
  return base + (date.getDate() % 3);
}

function levelFor(count: number): string {
  if (count === 0) return 'bg-black/5 dark:bg-white/[0.06]';
  if (count < 3) return 'bg-emerald-500/30';
  if (count < 6) return 'bg-emerald-500/55';
  if (count < 9) return 'bg-emerald-500/75';
  return 'bg-emerald-500';
}

export async function ContributionHeatmap() {
  const t = await getTranslations('github');
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 7 * 26);
  start.setDate(start.getDate() - start.getDay());

  const weeks: { date: Date; count: number }[][] = [];
  let cursor = new Date(start);
  let total = 0;
  for (let w = 0; w < 27; w += 1) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(cursor);
      const count = date <= today ? deterministicCount(date) : 0;
      total += count;
      week.push({ date, count });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('contributions')}</h2>
          <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">
            {total.toLocaleString()} commits, roughly.
          </p>
        </div>
      </header>
      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(({ date, count }) => (
                <span
                  key={date.toISOString()}
                  className={`h-[10px] w-[10px] rounded-[3px] ${levelFor(count)}`}
                  title={`${date.toDateString()}: ${count}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-foreground/50 dark:text-bg/50">
        less
        <span className="h-[10px] w-[10px] rounded-[3px] bg-black/5 dark:bg-white/[0.06]" />
        <span className="h-[10px] w-[10px] rounded-[3px] bg-emerald-500/30" />
        <span className="h-[10px] w-[10px] rounded-[3px] bg-emerald-500/55" />
        <span className="h-[10px] w-[10px] rounded-[3px] bg-emerald-500/75" />
        <span className="h-[10px] w-[10px] rounded-[3px] bg-emerald-500" />
        more
      </div>
    </article>
  );
}
