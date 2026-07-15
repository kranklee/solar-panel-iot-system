// Live status page pinging the internal API routes and rendering current health
// Server component does the fetch so first paint already shows real numbers
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';

interface ServiceCheck {
  name: string;
  url: string;
  optional?: boolean;
}

const SERVICES: ServiceCheck[] = [
  { name: 'Site', url: '/' },
  { name: 'GitHub API', url: '/api/github' },
  { name: 'AI Assistant', url: '/api/chat', optional: true },
  { name: 'Whoami', url: '/api/whoami' }
];

async function ping(url: string, base: string): Promise<{ ok: boolean; ms: number; status: number }> {
  const start = Date.now();
  try {
    const res = await fetch(new URL(url, base), {
      method: url.startsWith('/api/chat') ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: url.startsWith('/api/chat') ? JSON.stringify({ messages: [] }) : undefined,
      cache: 'no-store'
    });
    return { ok: res.ok || res.status === 400 || res.status === 503, ms: Date.now() - start, status: res.status };
  } catch {
    return { ok: false, ms: Date.now() - start, status: 0 };
  }
}

export default async function StatusPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('status');
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const results = await Promise.all(
    SERVICES.map(async (service) => ({ service, ...(await ping(service.url, base)) }))
  );

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">live</p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <ul className="space-y-2">
        {results.map(({ service, ok, ms, status }) => (
          <li
            key={service.name}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 dark:bg-card-dark"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`inline-block h-3 w-3 rounded-full ${
                  ok ? 'bg-accent' : 'bg-red-500'
                }`}
              />
              <p className="font-medium">{service.name}</p>
              <span className="rounded-full border bg-black/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground/60 dark:bg-white/[0.06] dark:text-bg/60">
                {ok ? t('operational') : t('down')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-foreground/60 dark:text-bg/60">
              <span>{t('responseTime')}: {ms} ms</span>
              <span>HTTP {status || 'ERR'}</span>
            </div>
          </li>
        ))}
      </ul>

      <Link href="/status" className="btn-ghost">
        {t('checkAgain')}
      </Link>
    </article>
  );
}
