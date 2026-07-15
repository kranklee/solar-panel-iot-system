// Observability dashboard for the portfolio itself, modelled after how SREs evaluate their own services
// Mounts a client side metrics widget that polls /api/metrics every few seconds
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ObservabilityDashboard } from '@/components/observability/ObservabilityDashboard';

export default async function ObservabilityPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('observability');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">live</p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <ObservabilityDashboard />

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">{t('philosophyTitle')}</h2>
        <p className="mt-2 text-sm text-foreground/80 dark:text-bg/80">{t('philosophyBody')}</p>
      </section>
    </article>
  );
}
