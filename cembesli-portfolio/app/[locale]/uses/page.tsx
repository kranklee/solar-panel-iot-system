// /uses page listing hardware, software, services, and everyday tooling
// Server rendered with content driven by simple in-file data tables
import { setRequestLocale, getTranslations } from 'next-intl/server';

interface Item {
  label: string;
  detail: string;
}

const HARDWARE: Item[] = [
  { label: 'Laptop', detail: 'MacBook Air M2 with 16 GB RAM' },
  { label: 'Display', detail: 'LG UltraFine 4K 27 inch' },
  { label: 'Keyboard', detail: 'Keychron K2 with brown switches' },
  { label: 'Mouse', detail: 'Logitech MX Master 3S' },
  { label: 'Audio', detail: 'AirPods Pro and AKG K371 over ears' }
];

const SOFTWARE: Item[] = [
  { label: 'Editor', detail: 'VS Code with Claude Code in the terminal' },
  { label: 'Terminal', detail: 'iTerm2 with zsh and starship prompt' },
  { label: 'Browser', detail: 'Arc for daily, Chrome for devtools' },
  { label: 'Design', detail: 'Figma for layouts, Excalidraw for diagrams' },
  { label: 'Database client', detail: 'TablePlus and the Supabase Studio' }
];

const SERVICES: Item[] = [
  { label: 'Hosting', detail: 'Vercel Edge for sites, Railway for cron jobs' },
  { label: 'Database', detail: 'Supabase Postgres with Realtime and Storage' },
  { label: 'Source control', detail: 'GitHub with Actions for CI' },
  { label: 'Analytics', detail: 'Vercel Analytics and Plausible' },
  { label: 'Email', detail: 'Resend for transactional and Mailchimp for letters' }
];

const EVERYDAY: Item[] = [
  { label: 'Notes', detail: 'Obsidian with the daily note workflow' },
  { label: 'Tasks', detail: 'Linear for projects, paper for the day' },
  { label: 'Calendar', detail: 'Cal.com for booking and Apple Calendar' },
  { label: 'Read later', detail: 'Readwise Reader' },
  { label: 'Music', detail: 'Apple Music with focus playlists on shuffle' }
];

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
      <h2 className="text-lg font-semibold">{title}</h2>
      <dl className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
            <dt className="text-sm font-medium">{item.label}</dt>
            <dd className="text-right text-xs text-foreground/70 dark:text-bg/70">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function UsesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('uses');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('hardware')}</p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Section title={t('hardware')} items={HARDWARE} />
        <Section title={t('software')} items={SOFTWARE} />
        <Section title={t('services')} items={SERVICES} />
        <Section title={t('everyday')} items={EVERYDAY} />
      </div>
    </article>
  );
}
