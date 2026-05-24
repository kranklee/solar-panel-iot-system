// Context that tracks visitor achievements persisted to localStorage
// Exposes an unlock function that surfaces a transient toast when a new badge is earned
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { useTranslations } from 'next-intl';

export type AchievementKey =
  | 'explorer'
  | 'polyglot'
  | 'themeShifter'
  | 'pythonista'
  | 'gamer'
  | 'conqueror'
  | 'curious'
  | 'secret';

interface AchievementsContextValue {
  unlocked: ReadonlySet<AchievementKey>;
  unlock: (key: AchievementKey) => void;
  isUnlocked: (key: AchievementKey) => boolean;
}

const STORAGE_KEY = 'cembesli.achievements';

const AchievementsContext = createContext<AchievementsContextValue | null>(null);

interface Toast {
  id: number;
  key: AchievementKey;
}

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('achievements');
  const [unlocked, setUnlocked] = useState<Set<AchievementKey>>(() => new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AchievementKey[];
        setUnlocked(new Set(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((set: Set<AchievementKey>): void => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  }, []);

  const unlock = useCallback(
    (key: AchievementKey): void => {
      setUnlocked((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        persist(next);
        toastIdRef.current += 1;
        const toast: Toast = { id: toastIdRef.current, key };
        setToasts((current) => [...current, toast]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((existing) => existing.id !== toast.id));
        }, 4000);
        return next;
      });
    },
    [persist]
  );

  const isUnlocked = useCallback((key: AchievementKey) => unlocked.has(key), [unlocked]);

  useEffect(() => {
    unlock('explorer');
  }, [unlock]);

  const value = useMemo<AchievementsContextValue>(
    () => ({ unlocked, unlock, isUnlocked }),
    [unlocked, unlock, isUnlocked]
  );

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[150] flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-up rounded-2xl border bg-card/95 px-4 py-3 shadow-lift backdrop-blur dark:bg-card-dark/95"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              {t('unlock')}
            </p>
            <p className="font-semibold">{t(toast.key)}</p>
            <p className="text-xs text-foreground/60 dark:text-bg/60">
              {t(`${toast.key}Desc` as const)}
            </p>
          </div>
        ))}
      </div>
    </AchievementsContext.Provider>
  );
}

export function useAchievements(): AchievementsContextValue {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    return {
      unlocked: new Set<AchievementKey>(),
      unlock: () => undefined,
      isUnlocked: () => false
    };
  }
  return ctx;
}
