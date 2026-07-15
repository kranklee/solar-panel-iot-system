// /projects index listing every published case study with the headline summary
// Server rendered so the listing is fully indexable for SEO and shareable previews
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CASE_STUDIES } from '@/lib/projects';

export default async function ProjectsIndex({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('projects');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">work</p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CASE_STUDIES.map((study) => (
          <li key={study.slug}>
            <Link
              href={`/${params.locale}/projects/${study.slug}`}
              className="flex h-full flex-col overflow-hidden rounded-card border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lift dark:bg-card-dark"
            >
              <div
                className="h-20"
                style={{
                  background: `linear-gradient(135deg, ${study.accent}55 0%, transparent 100%)`
                }}
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-foreground/50 dark:text-bg/50">
                  {study.year}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{study.title}</h2>
                <p className="mt-1 text-sm text-foreground/70 dark:text-bg/70">{study.summary}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  {study.tech.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.05]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
                <span className="mt-4 text-sm text-primary">{t('view')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
