// Contact card with email, social links, and a booking link rendered as accessible rows
// Booking URL is taken from NEXT_PUBLIC_BOOKING_URL when set, otherwise falls back to mailto
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ContactRow {
  key: 'email' | 'github' | 'linkedin' | 'booking';
  href: string;
  value: string;
}

function buildRows(bookingUrl: string | undefined): ContactRow[] {
  return [
    { key: 'email', href: 'mailto:cem@cembesli.com', value: 'cem@cembesli.com' },
    { key: 'github', href: 'https://github.com/kranklee', value: 'github.com/kranklee' },
    {
      key: 'linkedin',
      href: 'https://www.linkedin.com/in/cembesli',
      value: 'linkedin.com/in/cembesli'
    },
    {
      key: 'booking',
      href: bookingUrl ?? 'mailto:cem@cembesli.com?subject=Book%20a%20chat',
      value: bookingUrl ? new URL(bookingUrl).host : 'cem@cembesli.com'
    }
  ];
}

export function ContactCard() {
  const t = useTranslations('contact');
  const rows = buildRows(process.env.NEXT_PUBLIC_BOOKING_URL);

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>

      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {rows.map((row) => (
          <li key={row.key}>
            <Link
              href={row.href}
              target={row.href.startsWith('http') ? '_blank' : undefined}
              rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-between rounded-2xl border bg-black/[0.02] px-4 py-3 transition-colors hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.08]"
            >
              <span className="text-sm font-medium uppercase tracking-wide text-foreground/60 dark:text-bg/60">
                {t(row.key)}
              </span>
              <span className="truncate font-mono text-sm text-primary">{row.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
