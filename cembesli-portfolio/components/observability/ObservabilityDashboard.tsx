// Live polling observability dashboard that visualises the portfolio's own health
// Holds 60 seconds of history in memory and draws inline sparklines without a chart library
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Metrics {
  ts: number;
  site: {
    uptimeDays: number;
    deployments: number;
    commits24h: number;
    latestCommit: string;
  };
  edge: {
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    rps: number;
    cacheHitRate: number;
    errorRate: number;
  };
  api: Record<string, { ok: boolean; p95_ms: number }>;
  bundle: { firstLoadJsKb: number; middlewareKb: number; sharedChunksKb: number };
  lighthouse: { performance: number; accessibility: number; bestPractices: number; seo: number };
}

function sparkline(values: number[]): string {
  if (values.length < 2) return '';
  const width = 160;
  const height = 36;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function ObservabilityDashboard() {
  const t = useTranslations('observability');
  const [current, setCurrent] = useState<Metrics | null>(null);
  const historyRef = useRef<{ p95: number[]; rps: number[]; cache: number[] }>({
    p95: [],
    rps: [],
    cache: []
  });
  const [, force] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function tick(): Promise<void> {
      try {
        const res = await fetch('/api/metrics', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Metrics;
        if (cancelled) return;
        setCurrent(data);
        const history = historyRef.current;
        history.p95 = [...history.p95, data.edge.p95_ms].slice(-30);
        history.rps = [...history.rps, data.edge.rps].slice(-30);
        history.cache = [...history.cache, data.edge.cacheHitRate * 100].slice(-30);
        force((value) => value + 1);
      } catch {
        // ignore network blips
      }
    }
    void tick();
    const interval = window.setInterval(tick, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const apis = useMemo(() => (current ? Object.entries(current.api) : []), [current]);

  if (!current) {
    return (
      <div className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <p className="text-sm text-foreground/55 dark:text-bg/55">{t('loading')}</p>
      </div>
    );
  }

  const sparkP95 = sparkline(historyRef.current.p95);
  const sparkRps = sparkline(historyRef.current.rps);
  const sparkCache = sparkline(historyRef.current.cache);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/55 dark:text-bg/55">
          {t('edge')}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Metric label={t('p50')} value={`${current.edge.p50_ms} ms`} accent="#34d399" />
          <Metric label={t('p95')} value={`${current.edge.p95_ms} ms`} accent="#6366f1" />
          <Metric label={t('p99')} value={`${current.edge.p99_ms} ms`} accent="#f59e0b" />
          <Metric label={t('rps')} value={current.edge.rps.toFixed(2)} accent="#34d399" />
          <Metric
            label={t('cache')}
            value={`${(current.edge.cacheHitRate * 100).toFixed(1)}%`}
            accent="#6366f1"
          />
          <Metric
            label={t('errorRate')}
            value={`${(current.edge.errorRate * 100).toFixed(3)}%`}
            accent={current.edge.errorRate > 0.005 ? '#ef4444' : '#34d399'}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Trend label={`${t('p95')} ${t('trend')}`} path={sparkP95} color="#6366f1" />
          <Trend label={`${t('rps')} ${t('trend')}`} path={sparkRps} color="#34d399" />
          <Trend label={`${t('cache')} ${t('trend')}`} path={sparkCache} color="#f59e0b" />
        </div>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/55 dark:text-bg/55">
          {t('site')}
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={t('uptime')} value={`${current.site.uptimeDays} ${t('days')}`} />
          <Row label={t('deployments')} value={current.site.deployments.toString()} />
          <Row label={t('commits24h')} value={current.site.commits24h.toString()} />
          <Row
            label={t('latestCommit')}
            value={new Date(current.site.latestCommit).toLocaleString('de-DE', {
              dateStyle: 'short',
              timeStyle: 'short'
            })}
          />
        </dl>
        <h3 className="mt-5 text-sm font-semibold uppercase tracking-widest text-foreground/55 dark:text-bg/55">
          {t('lighthouse')}
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {(['performance', 'accessibility', 'bestPractices', 'seo'] as const).map((key) => (
            <div
              key={key}
              className="rounded-2xl border bg-black/[0.02] p-2 text-center dark:bg-white/[0.04]"
            >
              <p className="font-mono text-lg font-semibold text-emerald-400">
                {current.lighthouse[key]}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-foreground/55 dark:text-bg/55">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="lg:col-span-3 rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/55 dark:text-bg/55">
          {t('apis')}
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {apis.map(([name, status]) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-2xl border bg-black/[0.02] px-3 py-2 dark:bg-white/[0.04]"
            >
              <span className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={`inline-block h-2 w-2 rounded-full ${
                    status.ok ? 'bg-accent' : 'bg-red-500'
                  }`}
                />
                {name}
              </span>
              <span className="font-mono text-xs">{status.p95_ms.toFixed(0)} ms</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.04]">
      <p className="text-[10px] uppercase tracking-widest text-foreground/55 dark:text-bg/55">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-semibold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function Trend({ label, path, color }: { label: string; path: string; color: string }) {
  return (
    <div className="rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.04]">
      <p className="text-[10px] uppercase tracking-widest text-foreground/55 dark:text-bg/55">
        {label}
      </p>
      <svg
        viewBox="0 0 160 36"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="mt-2 h-9 w-full"
      >
        {path && <path d={path} fill="none" stroke={color} strokeWidth="1.5" />}
      </svg>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-1.5 last:border-b-0">
      <dt className="text-foreground/65 dark:text-bg/65">{label}</dt>
      <dd className="font-mono text-foreground/95 dark:text-bg/95">{value}</dd>
    </div>
  );
}
