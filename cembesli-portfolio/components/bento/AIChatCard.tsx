// AI assistant card that streams answers from /api/chat using fetch streaming
// Falls back gracefully to a configuration hint when ANTHROPIC_API_KEY is not set
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Turn {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatCard() {
  const t = useTranslations('ai');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  const send = useCallback(
    async (raw: string): Promise<void> => {
      const message = raw.trim();
      if (!message || pending) return;
      idRef.current += 1;
      const userTurn: Turn = { id: idRef.current, role: 'user', content: message };
      idRef.current += 1;
      const assistantTurn: Turn = { id: idRef.current, role: 'assistant', content: '' };
      setTurns((prev) => [...prev, userTurn, assistantTurn]);
      setInput('');
      setPending(true);

      try {
        const history: { role: 'user' | 'assistant'; content: string }[] = [
          ...turns.map((turn) => ({ role: turn.role, content: turn.content })),
          { role: 'user', content: message }
        ];
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        if (res.status === 503) {
          setUnavailable(true);
          setTurns((prev) => prev.filter((turn) => turn.id !== assistantTurn.id));
          return;
        }
        if (!res.ok || !res.body) {
          throw new Error(`status ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const snapshot = buffer;
          setTurns((prev) =>
            prev.map((turn) =>
              turn.id === assistantTurn.id ? { ...turn, content: snapshot } : turn
            )
          );
        }
      } catch (err) {
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === assistantTurn.id
              ? {
                  ...turn,
                  content:
                    err instanceof Error
                      ? `Error: ${err.message}`
                      : 'Something went wrong while reaching the AI.'
                }
              : turn
          )
        );
      } finally {
        setPending(false);
      }
    },
    [pending, turns]
  );

  const examples = [t('ex1'), t('ex2'), t('ex3')];

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="scrollbar-thin mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border bg-black/[0.02] p-3 text-sm dark:bg-white/[0.03]"
      >
        {turns.length === 0 && !unavailable && (
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/40">{t('examples')}</p>
            <ul className="mt-2 space-y-1.5">
              {examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => void send(example)}
                    className="w-full rounded-xl border bg-card px-3 py-2 text-left text-xs hover:bg-black/5 dark:bg-card-dark dark:hover:bg-white/10"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {unavailable && (
          <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-500 dark:text-amber-300">
            {t('unavailable')}
          </p>
        )}
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={
              turn.role === 'user'
                ? 'ml-auto max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-primary-foreground'
                : 'mr-auto max-w-[90%] rounded-2xl border bg-card px-3 py-2 dark:bg-card-dark'
            }
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {turn.content}
              {pending && turn.role === 'assistant' && turn.content === '' && (
                <span className="text-foreground/50 dark:text-bg/50">{t('thinking')}...</span>
              )}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('placeholder')}
          disabled={unavailable}
          className="flex-1 rounded-full border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 dark:bg-card-dark"
        />
        <button type="submit" disabled={pending || unavailable} className="btn-primary text-sm disabled:opacity-50">
          {t('send')}
        </button>
      </form>
    </article>
  );
}
