// Client side Anschreiben studio with company picker, role override, and language toggle
// Streams nothing for simplicity; fetches the full text from /api/anschreiben and shows it inline
'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { defaultRoleFor, type TargetCompany } from '@/lib/anschreiben';

interface AnschreibenStudioProps {
  companies: TargetCompany[];
}

export function AnschreibenStudio({ companies }: AnschreibenStudioProps) {
  const t = useTranslations('anschreiben');
  const [selected, setSelected] = useState<TargetCompany>(companies[0]);
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [role, setRole] = useState<string>(defaultRoleFor(companies[0].focus));
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async (): Promise<void> => {
    setLoading(true);
    setOutput('');
    setCopied(false);
    try {
      const res = await fetch('/api/anschreiben', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: selected.slug, role, language })
      });
      const text = await res.text();
      setOutput(text);
    } catch (err) {
      setOutput(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  }, [selected.slug, role, language]);

  const handlePick = (company: TargetCompany): void => {
    setSelected(company);
    setRole(defaultRoleFor(company.focus));
    setOutput('');
  };

  const copy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [output]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-card border bg-card p-4 dark:bg-card-dark">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 dark:text-bg/50">
          {t('targets')}
        </p>
        <ul className="mt-3 space-y-1">
          {companies.map((company) => (
            <li key={company.slug}>
              <button
                type="button"
                onClick={() => handlePick(company)}
                aria-pressed={selected.slug === company.slug}
                className={`flex w-full flex-col items-start rounded-2xl border px-3 py-2 text-left transition-colors ${
                  selected.slug === company.slug
                    ? 'border-primary/40 bg-primary/10'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-semibold">{company.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-foreground/55 dark:text-bg/55">
                  {company.city}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-3 rounded-card border bg-card p-5 dark:bg-card-dark sm:grid-cols-[1fr_auto_auto]">
          <label className="text-sm">
            <span className="block text-xs font-semibold uppercase tracking-widest text-foreground/55 dark:text-bg/55">
              {t('role')}
            </span>
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 w-full rounded-full border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary dark:bg-bg-dark"
            />
          </label>

          <div
            role="group"
            aria-label={t('language')}
            className="flex items-end gap-1 rounded-full border p-1"
          >
            {(['de', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                  language === code
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className="btn-primary self-end disabled:opacity-50"
          >
            {loading ? t('generating') : t('generate')}
          </button>
        </div>

        <div className="rounded-card border bg-card p-5 dark:bg-card-dark">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{selected.name}</h2>
              <p className="text-xs text-foreground/55 dark:text-bg/55">
                {selected.city} · {selected.focus}
              </p>
            </div>
            {output && (
              <div className="flex gap-2">
                <button type="button" onClick={() => void copy()} className="btn-ghost text-xs">
                  {copied ? t('copied') : t('copy')}
                </button>
                <a
                  href={selected.careers}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-xs"
                >
                  {t('careers')}
                </a>
              </div>
            )}
          </div>

          {output ? (
            <pre className="scrollbar-thin mt-4 max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border bg-black/[0.04] p-4 font-mono text-sm leading-relaxed dark:bg-white/[0.04]">
              {output}
            </pre>
          ) : (
            <p className="mt-4 text-sm text-foreground/55 dark:text-bg/55">{t('pickAndGenerate')}</p>
          )}
        </div>

        <p className="text-xs text-foreground/50 dark:text-bg/50">{t('disclosure')}</p>
      </section>
    </div>
  );
}
