// Apple style command palette opened with Cmd K or Ctrl K
// Fuzzy filters navigation routes, actions, and external links with full keyboard control
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useAchievements } from '@/components/providers/AchievementsProvider';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  group: 'navigate' | 'actions' | 'external';
  perform: () => void;
}

interface CommandPaletteProps {
  locale: string;
}

export function CommandPalette({ locale }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('cmdk');
  const tNav = useTranslations('nav');
  const tContact = useTranslations('contact');
  const tCv = useTranslations('cv');
  const { unlock } = useAchievements();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      } else if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      unlock('curious');
      window.setTimeout(() => inputRef.current?.focus(), 30);
      setQuery('');
      setActiveIndex(0);
    }
  }, [open, unlock]);

  const items = useMemo<CommandItem[]>(() => {
    const go = (path: string) => () => {
      const target = path.startsWith('http') ? path : `/${locale}${path}`;
      if (target.startsWith('http')) {
        window.open(target, '_blank', 'noopener,noreferrer');
      } else {
        router.push(target);
      }
      setOpen(false);
    };
    const toggleTheme = (): void => {
      const active = resolvedTheme ?? theme;
      setTheme(active === 'dark' ? 'light' : 'dark');
      setOpen(false);
    };
    return [
      { id: 'home', label: 'Home', group: 'navigate', perform: go('') },
      { id: 'dashboard', label: tNav('dashboard'), group: 'navigate', perform: go('/dashboard') },
      { id: 'projects', label: tNav('projects'), group: 'navigate', perform: go('/projects') },
      { id: 'uses', label: tNav('uses'), group: 'navigate', perform: go('/uses') },
      { id: 'now', label: tNav('now'), group: 'navigate', perform: go('/now') },
      { id: 'changelog', label: tNav('changelog'), group: 'navigate', perform: go('/changelog') },
      { id: 'blog', label: tNav('blog'), group: 'navigate', perform: go('/blog') },
      { id: 'anschreiben', label: tNav('anschreiben'), group: 'navigate', perform: go('/anschreiben') },
      { id: 'observability', label: tNav('observability'), group: 'navigate', perform: go('/observability') },
      { id: 'lebenslauf', label: tNav('lebenslauf'), group: 'navigate', perform: go('/lebenslauf') },
      { id: 'status', label: 'Status', group: 'navigate', perform: go('/status') },
      { id: 'impressum', label: tNav('impressum'), group: 'navigate', perform: go('/impressum') },
      { id: 'datenschutz', label: tNav('datenschutz'), group: 'navigate', perform: go('/datenschutz') },
      { id: 'cv', label: tCv('open'), group: 'actions', perform: go('#projects') },
      { id: 'theme', label: tNav('theme'), group: 'actions', perform: toggleTheme },
      {
        id: 'email',
        label: tContact('email'),
        group: 'external',
        perform: go('mailto:cem@cembesli.com')
      },
      {
        id: 'github',
        label: 'GitHub',
        group: 'external',
        perform: go('https://github.com/kranklee')
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        group: 'external',
        perform: go('https://www.linkedin.com/in/cembesli')
      }
    ];
  }, [locale, router, setTheme, theme, resolvedTheme, tNav, tCv, tContact]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  function onInputKey(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      filtered[activeIndex]?.perform();
    }
  }

  if (!open) return null;

  const grouped: Record<CommandItem['group'], CommandItem[]> = {
    navigate: [],
    actions: [],
    external: []
  };
  filtered.forEach((item) => grouped[item.group].push(item));

  let runningIndex = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-card border bg-card shadow-lift dark:bg-card-dark">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKey}
          placeholder={t('placeholder')}
          className="w-full border-b bg-transparent px-5 py-4 text-sm outline-none placeholder:text-foreground/40"
        />
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {(['navigate', 'actions', 'external'] as const).map((group) => {
            const list = grouped[group];
            if (list.length === 0) return null;
            return (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
                  {t(group)}
                </p>
                {list.map((item) => {
                  runningIndex += 1;
                  const isActive = runningIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.perform}
                      onMouseEnter={() => setActiveIndex(filtered.indexOf(item))}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="font-mono text-xs opacity-70">enter</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-foreground/50">No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
