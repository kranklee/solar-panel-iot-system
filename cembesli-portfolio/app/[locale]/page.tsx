// Locale aware home page composing the hero, bento grid, and contribution heatmap
// Fully server rendered with translations resolved at request time
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
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
          {t('role')}
        </p>
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
        <p className="mt-6 max-w-2xl text-base text-foreground/80 dark:text-bg/80">
          {t('tagline')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${params.locale}/projects`} className="btn-primary" aria-label={t('viewProjects')}>
            {t('viewProjects')}
          </Link>
          <Link href={`/${params.locale}#contact`} className="btn-ghost" aria-label={t('contact')}>
            {t('contact')}
          </Link>
          <Link href={`/${params.locale}/dashboard`} className="btn-ghost">
            Live dashboard
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
