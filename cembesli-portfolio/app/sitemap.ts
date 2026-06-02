// Generates the sitemap.xml describing every locale and named route
// Includes hreflang alternates so search engines understand the multilingual map
import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';

const ROUTES = [
  '',
  '/dashboard',
  '/uses',
  '/now',
  '/changelog',
  '/status',
  '/projects',
  '/lebenslauf',
  '/impressum',
  '/datenschutz'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cembesli.com';
  const now = new Date();
  return locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((other) => [other, `${siteUrl}/${other}${route}`])
        )
      }
    }))
  );
}
