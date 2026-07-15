// Locale aware home page composing the hero, bento grid, and contribution heatmap
// Hero now surfaces a live availability pulse and links into the Anschreiben studio
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { ContributionHeatmap } from '@/components/bento/ContributionHeatmap';

export default function LocaleHomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations('hero');

  return (
    <>
      <section className="animate-fade-up pb-16 pt-4" aria-labelledby="hero-heading">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium uppercase tracking-widest text-accent">
            <span
              aria-hidden="true"
              className="relative inline-flex h-2 w-2"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {t('available')}
          </span>
          <span className="rounded-full border bg-card/40 px-2.5 py-1 text-xs uppercase tracking-widest text-foreground/60 dark:bg-card-dark/40 dark:text-bg/60">
            {t('role')}
          </span>
        </div>
        <h1
          id="hero-heading"
          className="text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {t('name')}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/70 dark:text-bg/70 sm:text-xl">
          {t('subrole')}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/50 dark:text-bg/50">
          <span aria-hidden="true">DE</span>
          <span>{t('location')}</span>
          <span aria-hidden="true" className="opacity-50">/</span>
          <span className="text-foreground/70 dark:text-bg/70">{t('availability')}</span>
        </p>
        <p className="mt-6 max-w-2xl text-base text-foreground/80 dark:text-bg/80">{t('tagline')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${params.locale}/projects`} className="btn-primary" aria-label={t('viewProjects')}>
            {t('viewProjects')}
          </Link>
          <Link href={`/${params.locale}/anschreiben`} className="btn-ghost">
            {t('anschreiben')}
          </Link>
          <Link href={`/${params.locale}/lebenslauf`} className="btn-ghost">
            {t('lebenslauf')}
          </Link>
          <Link href={`/${params.locale}#contact`} className="btn-ghost" aria-label={t('contact')}>
            {t('contact')}
          </Link>
        </div>
      </section>

      <BentoGrid />

      <section className="mt-8">
        <ContributionHeatmap />
      </section>
    </>
  );
}
