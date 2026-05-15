// Sticky floating navbar with backdrop blur, theme toggle, and locale switcher
// Designed as a glass pill that stays visually distinct over any background
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { locales } from '@/i18n';
import { cn } from '@/lib/utils';

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function switchLocale(next: string): void {
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as (typeof locales)[number])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.push(segments.join('/') || `/${next}`);
  }

  const active = resolvedTheme ?? theme;

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="glass-pill flex w-full max-w-3xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4"
      >
        <Link
          href={`/${locale}`}
          className="rounded-full px-3 py-1.5 font-display text-base font-semibold tracking-tight"
        >
          Cem Besli<span className="text-primary">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <li>
            <Link href="#projects" className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              {t('projects')}
            </Link>
          </li>
          <li>
            <Link href="#stack" className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              {t('stack')}
            </Link>
          </li>
          <li>
            <Link href="#games" className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              {t('games')}
            </Link>
          </li>
          <li>
            <Link href="#contact" className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              {t('contact')}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-1.5">
          <div
            role="group"
            aria-label={t('language')}
            className="hidden items-center rounded-full border bg-card/40 dark:bg-card-dark/40 sm:flex"
          >
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                aria-pressed={locale === code}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide',
                  locale === code
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 dark:text-bg/70 hover:bg-black/5 dark:hover:bg-white/10'
                )}
              >
                {code}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTheme(active === 'dark' ? 'light' : 'dark')}
            aria-label={t('theme')}
            className="grid h-9 w-9 place-items-center rounded-full border bg-card/40 dark:bg-card-dark/40 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {mounted ? (active === 'dark' ? <SunIcon /> : <MoonIcon />) : <SunIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
