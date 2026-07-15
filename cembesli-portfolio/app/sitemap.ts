// Generates the sitemap.xml describing every locale and named route
// Includes hreflang alternates so search engines understand the multilingual map
import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { listSlugs } from '@/lib/blog';

const STATIC_ROUTES = [
  '',
  '/dashboard',
  '/uses',
  '/now',
  '/changelog',
  '/status',
  '/projects',
  '/blog',
  '/anschreiben',
  '/observability',
  '/lebenslauf',
  '/impressum',
  '/datenschutz'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cembesli.com';
  const now = new Date();
  const blogSlugs = await listSlugs();
  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
  const routes = [...STATIC_ROUTES, ...blogRoutes];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
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
