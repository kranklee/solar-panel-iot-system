// Blog post detail page rendered from MDX with locale aware metadata
// generateStaticParams enumerates every post slug across every locale so the routes are pre rendered
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/mdx-components';
import { getPost, listSlugs } from '@/lib/blog';
import { locales } from '@/i18n';

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      locale: post.lang
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(params.locale);
  const post = await getPost(params.slug);
  if (!post) notFound();
  const t = await getTranslations('blog');
  const components = mdxComponents();

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={`/${params.locale}/blog`}
        className="mb-6 inline-block text-xs text-foreground/55 hover:text-primary dark:text-bg/55"
      >
        {t('back')}
      </Link>

      <header className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/55 dark:text-bg/55">
          <span className="font-mono uppercase tracking-widest">{post.date}</span>
          <span aria-hidden="true">·</span>
          <span className="rounded-full border bg-black/[0.04] px-2 py-0.5 font-semibold tracking-wide dark:bg-white/[0.06]">
            {post.lang.toUpperCase()}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {post.readingMinutes} {t('minutes')}
          </span>
        </div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{post.title}</h1>
        <p className="text-foreground/70 dark:text-bg/70">{post.description}</p>
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 text-[10px]">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.05]"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="prose prose-invert mt-6 max-w-none text-base text-foreground/90 dark:text-bg/90">
        <MDXRemote source={post.content} components={components} />
      </div>
    </article>
  );
}
