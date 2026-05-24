// Case study detail page driven by the static catalog in lib/projects.ts
// Generates static params for every slug so each route is pre rendered
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CASE_STUDIES, findCaseStudy } from '@/lib/projects';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    CASE_STUDIES.map((study) => ({ locale, slug: study.slug }))
  );
}

export default async function CaseStudyPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('projects');
  const study = findCaseStudy(params.slug);
  if (!study) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <header
        className="rounded-card border p-8"
        style={{
          background: `linear-gradient(135deg, ${study.accent}33 0%, transparent 60%)`
        }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-foreground/60 dark:text-bg/60">
          {study.year}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{study.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-foreground/80 dark:text-bg/80">{study.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
          {study.tech.map((tech) => (
            <li
              key={tech}
              className="rounded-full border bg-black/[0.04] px-2.5 py-1 dark:bg-white/[0.05]"
            >
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={study.href} target="_blank" rel="noopener noreferrer" className="btn-primary">
            {t('viewCode')}
          </Link>
          <Link href={`/${params.locale}`} className="btn-ghost">
            {t('back')}
          </Link>
        </div>
      </header>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">{t('problem')}</h2>
        <p className="mt-2 text-sm text-foreground/80 dark:text-bg/80">{study.problem}</p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">{t('design')}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80 dark:text-bg/80">
          {study.design.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">{t('lessons')}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80 dark:text-bg/80">
          {study.lessons.map((lesson) => (
            <li key={lesson}>{lesson}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
