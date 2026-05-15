// Contact card with email and social links rendered as accessible action rows
// Intentionally form free to keep the surface area tight and reliable
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ContactRow {
  key: 'email' | 'github' | 'linkedin';
  href: string;
  value: string;
}

const ROWS: ContactRow[] = [
  { key: 'email', href: 'mailto:cem@cembesli.com', value: 'cem@cembesli.com' },
  { key: 'github', href: 'https://github.com/kranklee', value: 'github.com/kranklee' },
  { key: 'linkedin', href: 'https://www.linkedin.com/in/cembesli', value: 'linkedin.com/in/cembesli' }
];

export function ContactCard() {
  const t = useTranslations('contact');

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>

      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {ROWS.map((row) => (
          <li key={row.key}>
            <Link
              href={row.href}
              target={row.key === 'email' ? undefined : '_blank'}
              rel={row.key === 'email' ? undefined : 'noopener noreferrer'}
              className="flex items-center justify-between rounded-2xl border bg-black/[0.02] px-4 py-3 transition-colors hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.08]"
            >
              <span className="text-sm font-medium uppercase tracking-wide text-foreground/60 dark:text-bg/60">
                {t(row.key)}
              </span>
              <span className="font-mono text-sm text-primary">{row.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
