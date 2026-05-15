// CV preview card that triggers a modal containing the embedded PDF and download link
// PDF is served from /public/cv.pdf and rendered inside an iframe for compatibility
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';

export function CVModal() {
  const t = useTranslations('cv');
  const [open, setOpen] = useState(false);

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">
          Cem Besli, Ottawa, Ontario.
        </p>
      </header>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen(true)} className="btn-primary">
          {t('open')}
        </button>
        <a href="/cv.pdf" download className="btn-ghost" aria-label={t('download')}>
          {t('download')}
        </a>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('title')} closeLabel={t('close')}>
        <iframe
          src="/cv.pdf"
          title={t('title')}
          className="h-[70vh] w-full"
        />
      </Modal>
    </article>
  );
}
