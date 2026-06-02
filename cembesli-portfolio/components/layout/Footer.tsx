// Shared site footer with copyright, status link, legal section, and credit line
// Legal section is mandatory in Germany so the Impressum and Datenschutz links sit here on every page
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
          <li>
            <Link href="/lebenslauf" className="hover:text-primary">
              {t('lebenslauf')}
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs">{t('built')}</p>
        <ul
          aria-label={t('legal')}
          className="flex flex-wrap items-center gap-3 text-xs"
        >
          <li className="font-semibold uppercase tracking-widest text-foreground/40">
            {t('legal')}
          </li>
          <li>
            <Link href="/impressum" className="hover:text-primary">
              {t('impressum')}
            </Link>
          </li>
          <li>
            <Link href="/datenschutz" className="hover:text-primary">
              {t('datenschutz')}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
