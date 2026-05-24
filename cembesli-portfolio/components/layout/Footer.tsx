// Shared site footer with copyright, status link, and credit line
// Server rendered so it appears identically on every locale segment
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="mx-auto mt-24 w-full max-w-7xl border-t px-4 pb-16 pt-8 text-sm text-foreground/60 dark:text-bg/60 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} Cem Besli. {t('rights')}
        </p>
        <ul className="flex flex-wrap items-center gap-3 text-xs">
          <li>
            <Link href="/status" className="hover:text-primary">
              {t('status')}
            </Link>
          </li>
          <li>
            <Link href="/uses" className="hover:text-primary">
              {t('uses')}
            </Link>
          </li>
          <li>
            <Link href="/now" className="hover:text-primary">
              {t('now')}
            </Link>
          </li>
        </ul>
      </div>
      <p className="mt-3 text-xs">{t('built')}</p>
    </footer>
  );
}
