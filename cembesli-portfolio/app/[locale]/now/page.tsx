// /now page describing current focus areas with last updated indicator
// Inspired by the nownownow.com convention popularized by Derek Sivers
import { setRequestLocale, getTranslations } from 'next-intl/server';

const UPDATED_AT = '2026-05-24';

const FOCUS = [
  {
    title: 'Settling in Germany',
    body: 'Now based in Germany. Open to full stack and platform roles in Berlin, Munich, Cologne, and remote across the EU. EU Blue Card eligible at the IT Mangelberuf threshold.'
  },
  {
    title: 'German at B1 to B2',
    body: 'Holding daily conversations and reading technical content in German. Pushing toward C1 with newspapers and tech podcasts.'
  },
  {
    title: 'Shipping cembesli.com v1.1',
    body: 'AI assistant, live solar panel dashboard, command palette, and the Lebenslauf-format CV for German recruiters. Cleaning up mobile and accessibility along the way.'
  },
  {
    title: 'Finishing the IoT capstone',
    body: 'Refactoring the MQTT publisher and subscriber so they share a typed schema. Targeting persistent storage in Supabase Postgres so the dashboard has history.'
  },
  {
    title: 'Reading',
    body: 'Designing Data Intensive Applications by Martin Kleppmann. Slow, careful, with marginalia.'
  },
  {
    title: 'Learning',
    body: 'Going deeper on React Server Components, view transitions, and a little Rust on the side.'
  }
];

export default async function NowPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('now');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Updated {UPDATED_AT}
        </p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <ul className="grid grid-cols-1 gap-4">
        {FOCUS.map((item) => (
          <li
            key={item.title}
            className="rounded-card border bg-card p-6 dark:bg-card-dark"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-foreground/70 dark:text-bg/70">{item.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
