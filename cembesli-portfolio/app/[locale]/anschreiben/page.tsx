// Anschreiben page combining the company picker with live AI generated cover letters
// Server renders the company catalog and hands off to a client component for generation
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AnschreibenStudio } from '@/components/anschreiben/AnschreibenStudio';
import { TARGET_COMPANIES } from '@/lib/anschreiben';

export default async function AnschreibenPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('anschreiben');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t('badge')}
        </p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <AnschreibenStudio companies={TARGET_COMPANIES} />
    </article>
  );
}
