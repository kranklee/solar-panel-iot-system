// Bento entry card teasing the Anschreiben generator with a list of target German employers
// Links into the full studio at /anschreiben so users can pick a company and generate the letter
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TARGET_COMPANIES } from '@/lib/anschreiben';

export function AnschreibenCard() {
  const t = useTranslations('anschreiben');
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('cardTitle')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('cardSubtitle')}</p>
      </header>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {TARGET_COMPANIES.slice(0, 8).map((company) => (
          <li
            key={company.slug}
            className="rounded-full border bg-black/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-wide text-foreground/70 dark:bg-white/[0.05] dark:text-bg/70"
          >
            {company.name}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <Link href={`/${locale}/anschreiben`} className="btn-primary text-sm">
          {t('openStudio')}
        </Link>
      </div>
    </article>
  );
}
