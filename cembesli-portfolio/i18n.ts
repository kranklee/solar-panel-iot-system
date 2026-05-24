// next-intl runtime configuration loading locale specific messages
// Uses the modern requestLocale API with a defensive fallback to the default locale
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr', 'de'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

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
