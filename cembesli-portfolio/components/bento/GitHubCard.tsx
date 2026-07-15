// Live GitHub profile card fetched from the internal /api/github route
// Shows avatar, follower stats, and the three most recent repositories
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';
import { colorForLanguage, formatNumber } from '@/lib/utils';
import type { GitHubProfile, GitHubRepo } from '@/lib/github';

interface ApiResponse {
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

export function GitHubCard() {
  const t = useTranslations('github');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const res = await fetch('/api/github', { next: { revalidate: 60 } });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'failed');
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
        </div>
        {data && (
          <Link
            href={data.profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
            aria-label={t('viewProfile')}
          >
            {t('viewProfile')}
          </Link>
        )}
      </header>

      {error && !data ? (
        <p className="mt-6 text-sm text-red-500">{t('error')}</p>
      ) : !data ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-3">
            <Image
              src={data.profile.avatar_url}
              alt={data.profile.login}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {data.profile.name ?? data.profile.login}
              </p>
              <p className="truncate text-xs text-foreground/60 dark:text-bg/60">
                {data.profile.bio ?? `@${data.profile.login}`}
              </p>
              <p className="mt-1 text-xs text-foreground/50 dark:text-bg/50">
                {formatNumber(data.profile.followers)} {t('followers')} ·{' '}
                {formatNumber(data.profile.following)} {t('following')}
              </p>
            </div>
          </div>

          <ul className="mt-5 grid flex-1 gap-2">
            {data.repos.map((repo) => (
              <li key={repo.id}>
                <Link
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border bg-black/[0.02] p-3 transition-colors hover:bg-black/[0.04] dark:bg-white/[0.02] dark:hover:bg-white/[0.06]"
                >
                  <p className="font-mono text-sm font-medium text-primary">{repo.name}</p>
                  {repo.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-foreground/70 dark:text-bg/70">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-foreground/60 dark:text-bg/60">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: colorForLanguage(repo.language) }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span aria-label={t('stars')}>
                      &#9733; {formatNumber(repo.stargazers_count)}
                    </span>
                    <span aria-label={t('forks')}>
                      &#x2387; {formatNumber(repo.forks_count)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
