// next-intl runtime configuration loading locale specific messages
// Supports EN, FR, DE, TR with defensive fallback to default locale
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr', 'de', 'tr'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Francais',
  de: 'Deutsch',
  tr: 'Turkce'
};

function isLocale(value: string | undefined): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let candidate: string | undefined;
  try {
    candidate = await requestLocale;
  } catch {
    candidate = undefined;
  }
  const locale: Locale = isLocale(candidate) ? candidate : defaultLocale;
  const messages = (await import(`./messages/${locale}/index.json`)).default;
  return {
    locale,
    messages,
    timeZone: 'America/Toronto'
  };
});
