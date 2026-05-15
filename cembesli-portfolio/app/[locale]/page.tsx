// Locale aware home page composing the hero and bento grid of feature cards
// Fully server rendered with translations resolved at request time
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { BentoGrid } from '@/components/bento/BentoGrid';

export default function LocaleHomePage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  const t = useTranslations('hero');
  const tFooter = useTranslations('footer');

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
        <p className="mt-2 text-sm text-foreground/50 dark:text-bg/50">{t('location')}</p>
        <p className="mt-6 max-w-2xl text-base text-foreground/80 dark:text-bg/80">
          {t('tagline')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#projects" className="btn-primary" aria-label={t('viewProjects')}>
            {t('viewProjects')}
          </Link>
          <Link href="#contact" className="btn-ghost" aria-label={t('contact')}>
            {t('contact')}
          </Link>
        </div>
      </section>

      <BentoGrid />

      <footer className="mt-24 border-t pt-8 text-sm text-foreground/60 dark:text-bg/60">
        <p>
          &copy; {new Date().getFullYear()} Cem Besli. {tFooter('rights')}
        </p>
        <p className="mt-1">{tFooter('built')}</p>
      </footer>
    </>
  );
}
