// MDX blog index listing every post with title, language tag, and reading time
// Posts are filesystem driven from content/blog so a new post is a single MDX file
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { listPosts } from '@/lib/blog';

const LANG_LABEL: Record<string, string> = {
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  tr: 'TR'
};

export default async function BlogIndex({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('blog');
  const posts = await listPosts();

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">writing</p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      {posts.length === 0 && (
        <p className="rounded-card border bg-card p-6 text-sm text-foreground/60 dark:bg-card-dark dark:text-bg/60">
          {t('empty')}
        </p>
      )}

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/${params.locale}/blog/${post.slug}`}
              className="block rounded-card border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift dark:bg-card-dark"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/55 dark:text-bg/55">
                <span className="font-mono uppercase tracking-widest">{post.date}</span>
                <span aria-hidden="true">·</span>
                <span className="rounded-full border bg-black/[0.04] px-2 py-0.5 font-semibold tracking-wide dark:bg-white/[0.06]">
                  {LANG_LABEL[post.lang] ?? post.lang}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {post.readingMinutes} {t('minutes')}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-foreground/70 dark:text-bg/70">{post.description}</p>
              {post.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
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
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-foreground/50 dark:text-bg/50">
        <Link href="/feed.xml" className="hover:text-primary">
          RSS feed
        </Link>
      </p>
    </article>
  );
}
