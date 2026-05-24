// Locale aware route segment error boundary surfacing a friendly recovery action
// Keeps the navbar and overall shell rendered while only this segment recovers
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface SegmentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: SegmentErrorProps) {
  const t = useTranslations('status');

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('locale error', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-card border bg-card p-8 dark:bg-card-dark">
      <span className="rounded-full border bg-red-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-red-500">
        {t('down')}
      </span>
      <h2 className="text-2xl font-semibold">Something broke on this page.</h2>
      <p className="text-sm text-foreground/70 dark:text-bg/70">{error.message}</p>
      <button type="button" onClick={reset} className="btn-primary">
        {t('checkAgain')}
      </button>
    </div>
  );
}
