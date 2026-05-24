// Floating glass pill navbar with mobile drawer, theme toggle, locale switcher, and command palette hint
// Mounted at the top of every locale segment and self heals across themes and routes
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { locales } from '@/i18n';
import { useAchievements } from '@/components/providers/AchievementsProvider';
import { cn } from '@/lib/utils';

interface NavbarProps {
  locale: string;
}

const NAV_LINKS = [
  { href: '#projects', key: 'projects' as const },
  { href: '#games', key: 'games' as const },
  { href: '#stack', key: 'stack' as const },
  { href: '/dashboard', key: 'dashboard' as const },
  { href: '#contact', key: 'contact' as const }
];

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { unlock } = useAchievements();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMac(/Mac|iPhone|iPad/i.test(window.navigator.platform));
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function switchLocale(next: string): void {
    if (next !== locale) unlock('polyglot');
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as (typeof locales)[number])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.push(segments.join('/') || `/${next}`);
  }

  function toggleTheme(): void {
    const active = resolvedTheme ?? theme;
    setTheme(active === 'dark' ? 'light' : 'dark');
    unlock('themeShifter');
  }

  function openPalette(): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }

  const active = resolvedTheme ?? theme;
  const homeHref = `/${locale}`;
  const resolveHref = (href: string): string =>
    href.startsWith('#') ? `${homeHref}${href}` : `${homeHref}${href}`;

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="glass-pill flex w-full max-w-4xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4"
      >
        <Link
          href={homeHref}
          className="rounded-full px-3 py-1.5 font-display text-base font-semibold tracking-tight"
        >
          Cem Besli<span className="text-primary">.</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={resolveHref(link.href)}
                className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openPalette}
            aria-label={t('commandPalette')}
            className="hidden items-center gap-1.5 rounded-full border bg-card/40 px-2.5 py-1.5 text-xs text-foreground/70 hover:bg-black/5 dark:bg-card-dark/40 dark:text-bg/70 dark:hover:bg-white/10 sm:inline-flex"
          >
            <kbd className="font-mono text-[10px]">{isMac ? 'Cmd' : 'Ctrl'}</kbd>
            <kbd className="font-mono text-[10px]">K</kbd>
          </button>

          <div
            role="group"
            aria-label={t('language')}
            className="hidden items-center rounded-full border bg-card/40 dark:bg-card-dark/40 md:flex"
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
            onClick={toggleTheme}
            aria-label={t('theme')}
            className="grid h-9 w-9 place-items-center rounded-full border bg-card/40 dark:bg-card-dark/40 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {mounted ? (active === 'dark' ? <SunIcon /> : <MoonIcon />) : <SunIcon />}
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('menu')}
            aria-expanded={drawerOpen}
            className="grid h-9 w-9 place-items-center rounded-full border bg-card/40 hover:bg-black/5 dark:bg-card-dark/40 dark:hover:bg-white/10 lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('close')}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-card p-6 shadow-lift dark:bg-card-dark">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg font-semibold">
                Cem Besli<span className="text-primary">.</span>
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('close')}
                className="grid h-9 w-9 place-items-center rounded-full border hover:bg-black/5 dark:hover:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={resolveHref(link.href)}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-2xl px-3 py-2 text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/${locale}/uses`}
                  onClick={() => setDrawerOpen(false)}
                  className="block rounded-2xl px-3 py-2 text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t('uses')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/now`}
                  onClick={() => setDrawerOpen(false)}
                  className="block rounded-2xl px-3 py-2 text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t('now')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/changelog`}
                  onClick={() => setDrawerOpen(false)}
                  className="block rounded-2xl px-3 py-2 text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t('changelog')}
                </Link>
              </li>
            </ul>

            <div
              role="group"
              aria-label={t('language')}
              className="mt-6 flex items-center gap-1 rounded-full border bg-bg/50 p-1 dark:bg-bg-dark/50"
            >
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    switchLocale(code);
                    setDrawerOpen(false);
                  }}
                  aria-pressed={locale === code}
                  className={cn(
                    'flex-1 rounded-full px-2 py-1 text-xs font-medium uppercase tracking-wide',
                    locale === code
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
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

function MenuIcon() {
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
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
