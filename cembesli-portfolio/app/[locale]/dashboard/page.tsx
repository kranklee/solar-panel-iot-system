// Standalone dashboard page that gives the IoT solar panel feed extra real estate
// Reuses the SolarDashboardCard plus a brief architecture explainer
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SolarDashboardCard } from '@/components/bento/SolarDashboardCard';

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('dashboard');

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t('panels')}
        </p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-h-[360px]">
          <SolarDashboardCard />
        </div>
        <div className="bento-card flex h-full flex-col p-6">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="mt-3 space-y-3 text-sm text-foreground/80 dark:text-bg/80">
            <li>
              <span className="font-semibold text-primary">1.</span> A simulated rooftop sensor
              emits a power reading and a weather condition every second.
            </li>
            <li>
              <span className="font-semibold text-primary">2.</span> An MQTT publisher serializes
              the reading as JSON and pushes it to a broker, with weather affecting output between
              5 percent and 100 percent of peak.
            </li>
            <li>
              <span className="font-semibold text-primary">3.</span> A subscriber persists each
              reading to Supabase, fanning it out over Realtime websockets to every visitor on
              this dashboard.
            </li>
            <li>
              <span className="font-semibold text-primary">4.</span> The chart you see updates
              client side as new rows land, without polling.
            </li>
          </ol>
          <p className="mt-auto pt-4 text-xs text-foreground/60 dark:text-bg/60">
            In this preview the feed is generated locally so the page works without a broker. Wire
            it to MQTT by pointing the subscriber at your Supabase project.
          </p>
        </div>
      </div>
    </section>
  );
}
