// Locale aware root layout wiring fonts, providers, navbar, analytics, and metadata
// Injects JSON-LD structured data, hreflang alternates, skip link, and command palette
import type { Metadata } from 'next';
import { Syne, DM_Sans, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AchievementsProvider } from '@/components/providers/AchievementsProvider';
import { Navbar } from '@/components/layout/Navbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { KonamiEgg } from '@/components/layout/KonamiEgg';
import { DevtoolsBanner } from '@/components/layout/DevtoolsBanner';
import { Footer } from '@/components/layout/Footer';
import { locales } from '@/i18n';
import '@/styles/globals.css';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap'
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cembesli.com';
  const path = params.locale === 'en' ? '' : `/${params.locale}`;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((code) => [code, `${siteUrl}/${code}`])
  );
  languages['x-default'] = siteUrl;

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}${path}`,
      languages
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteUrl}${path}`,
      siteName: 'Cem Besli',
      locale: params.locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description')
    },
    icons: { icon: '/favicon.svg' }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale as (typeof locales)[number])) {
    notFound();
  }
  setRequestLocale(params.locale);
  const messages = await getMessages();
  const tNav = await getTranslations({ locale: params.locale, namespace: 'nav' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cembesli.com';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Cem Besli',
    url: siteUrl,
    email: 'mailto:cem@cembesli.com',
    image: `${siteUrl}/icon-192.svg`,
    jobTitle: 'Software Engineer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ottawa',
      addressRegion: 'Ontario',
      addressCountry: 'Canada'
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Centennial College'
    },
    knowsLanguage: ['English', 'French', 'German', 'Turkish'],
    sameAs: [
      'https://github.com/kranklee',
      'https://www.linkedin.com/in/cembesli'
    ]
  };

  return (
    <html
      lang={params.locale}
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-foreground dark:bg-bg-dark dark:text-bg antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={params.locale}>
            <AchievementsProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
              >
                {tNav('skipToContent')}
              </a>
              <Navbar locale={params.locale} />
              <CommandPalette locale={params.locale} />
              <KonamiEgg />
              <DevtoolsBanner />
              <main
                id="main"
                className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8"
              >
                {children}
              </main>
              <Footer />
            </AchievementsProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
