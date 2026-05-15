// next-intl runtime configuration loading locale specific messages
// Uses the modern requestLocale API and validates the requested locale
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr', 'de'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as Locale) ? (requested as Locale) : undefined;
  if (!locale) {
    notFound();
  }
  const messages = (await import(`./messages/${locale}/index.json`)).default;
  return {
    locale,
    messages,
    timeZone: 'America/Toronto'
  };
});
