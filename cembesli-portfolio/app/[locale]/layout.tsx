// Locale aware layout that wires next-intl, next-themes, fonts, and global styles
// Generates metadata and provides translation context to every nested route
import type { Metadata } from 'next';
import { Syne, DM_Sans, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
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
  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: siteUrl,
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
  unstable_setRequestLocale(params.locale);
  const messages = await getMessages();

  return (
    <html
      lang={params.locale}
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-foreground dark:bg-bg-dark dark:text-bg antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={params.locale}>
            <Navbar locale={params.locale} />
            <main id="main" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
              {children}
            </main>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
