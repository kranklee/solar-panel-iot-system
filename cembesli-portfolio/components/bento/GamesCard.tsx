// Aggregates the three playable games with tabbed switching and the global leaderboard
// Subscribes to Supabase realtime updates so new scores arrive without refresh
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StarblastGame } from '@/components/games/StarblastGame';
import { AgeOfWarGame } from '@/components/games/AgeOfWarGame';
import { DroneSimGame } from '@/components/games/DroneSimGame';
import { getBrowserSupabase, type GameKey, type ScoreRow } from '@/lib/supabase';
import { useAchievements } from '@/components/providers/AchievementsProvider';
import { isMuted, setMuted } from '@/lib/sound';
import { cn } from '@/lib/utils';

const GAMES: GameKey[] = ['starblast', 'ageofwar', 'dronesim'];
const PLAYED_KEY = 'cembesli.gamesPlayed';

export function GamesCard() {
  const t = useTranslations('games');
  const { unlock } = useAchievements();
  const [active, setActive] = useState<GameKey>('starblast');
  const [scores, setScores] = useState<Record<GameKey, ScoreRow[]>>({
    starblast: [],
    ageofwar: [],
    dronesim: []
  });
  const [playerName, setPlayerName] = useState('');
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);
  const [muted, setMutedLocal] = useState(false);
  const playedRef = useRef<Set<GameKey>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PLAYED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameKey[];
        parsed.forEach((entry) => playedRef.current.add(entry));
        if (playedRef.current.size >= GAMES.length) unlock('conqueror');
      }
    } catch {
      // ignore
    }
  }, [unlock]);

  const loadScores = useCallback(async (): Promise<void> => {
    try {
      const supabase = getBrowserSupabase();
      const next: Record<GameKey, ScoreRow[]> = {
        starblast: [],
        ageofwar: [],
        dronesim: []
      };
      for (const game of GAMES) {
        const { data } = await supabase
          .from('scores')
          .select('*')
          .eq('game', game)
          .order('score', { ascending: false })
          .limit(5);
        if (data) next[game] = data as ScoreRow[];
      }
      setScores(next);
    } catch {
      setSupabaseAvailable(false);
    }
  }, []);

  useEffect(() => {
    void loadScores();
  }, [loadScores]);

  useEffect(() => {
    if (!supabaseAvailable) return;
    let cleanup: (() => void) | undefined;
    try {
      const supabase = getBrowserSupabase();
      const channel = supabase
        .channel('scores-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'scores' },
          () => {
            void loadScores();
          }
        )
        .subscribe();
      cleanup = () => {
        void supabase.removeChannel(channel);
      };
    } catch {
      setSupabaseAvailable(false);
    }
    return cleanup;
  }, [loadScores, supabaseAvailable]);

  const submitScore = useCallback(
    async (game: GameKey, score: number): Promise<void> => {
      setPendingScore(score);
      if (!playerName.trim()) return;
      if (!supabaseAvailable) return;
      try {
        const supabase = getBrowserSupabase();
        await supabase.from('scores').insert({
          player_name: playerName.trim().slice(0, 32),
          game,
          score
        });
        setPendingScore(null);
        await loadScores();
      } catch {
        setSupabaseAvailable(false);
      }
    },
    [playerName, supabaseAvailable, loadScores]
  );

  const handleGameOver = useCallback(
    (score: number) => {
      setPendingScore(score);
      playedRef.current.add(active);
      try {
        window.localStorage.setItem(
          PLAYED_KEY,
          JSON.stringify(Array.from(playedRef.current))
        );
      } catch {
        // ignore
      }
      if (playedRef.current.size >= GAMES.length) {
        unlock('conqueror');
      }
      if (playerName.trim()) {
        void submitScore(active, score);
      }
    },
    [active, playerName, submitScore, unlock]
  );

  const toggleMute = useCallback(() => {
    setMutedLocal((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  useEffect(() => {
    setMutedLocal(isMuted());
  }, []);

  const activeBoard = useMemo(() => scores[active], [scores, active]);

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? t('unmute') : t('mute')}
          className="rounded-full border bg-card/40 px-3 py-1 text-xs dark:bg-card-dark/40"
        >
          {muted ? t('unmute') : t('mute')}
        </button>
      </header>

      <div role="tablist" aria-label={t('title')} className="mt-4 flex flex-wrap gap-1.5">
        {GAMES.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              active === key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="min-h-[320px] overflow-hidden rounded-2xl border bg-black/90">
          {active === 'starblast' && <StarblastGame onGameOver={handleGameOver} />}
          {active === 'ageofwar' && <AgeOfWarGame onGameOver={handleGameOver} />}
          {active === 'dronesim' && <DroneSimGame onGameOver={handleGameOver} />}
        </div>

        <aside
          aria-label={t('leaderboard')}
          className="flex flex-col rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.03]"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60 dark:text-bg/60">
            {t('leaderboard')}
          </h3>
          <ol className="mt-2 flex-1 space-y-1.5">
            {activeBoard.length === 0 && (
              <li className="text-xs text-foreground/50 dark:text-bg/50">{t('noScores')}</li>
            )}
            {activeBoard.map((row, index) => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-lg bg-card px-2.5 py-1.5 text-sm dark:bg-card-dark"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-foreground/50 dark:text-bg/50">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="truncate">{row.player_name}</span>
                </span>
                <span className="font-mono font-semibold text-primary">{row.score}</span>
              </li>
            ))}
          </ol>

          <div className="mt-3 space-y-2 border-t pt-3">
            <label htmlFor="player-name" className="text-xs text-foreground/60 dark:text-bg/60">
              {t('yourName')}
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              maxLength={32}
              className="w-full rounded-full border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary dark:bg-card-dark"
            />
            {pendingScore !== null && (
              <button
                type="button"
                onClick={() => void submitScore(active, pendingScore)}
                disabled={!playerName.trim() || !supabaseAvailable}
                className="btn-primary w-full text-sm disabled:opacity-50"
              >
                {t('submit')} ({pendingScore})
              </button>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
