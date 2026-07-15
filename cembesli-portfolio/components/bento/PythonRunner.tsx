// Pyodide powered Python terminal that runs inside a Web Worker
// The worker is created from an inlined blob so no extra public asset is needed
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAchievements } from '@/components/providers/AchievementsProvider';

const FIBONACCI_EXAMPLE = `def fib(n):
    a, b = 0, 1
    seq = []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq

print(fib(10))
`;

const WORKER_SOURCE = `
let pyodideReady = null;

async function ensurePyodide() {
  if (pyodideReady) return pyodideReady;
  pyodideReady = (async () => {
    self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');
    const pyodide = await self.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
    });
    pyodide.setStdout({ batched: (msg) => self.postMessage({ type: 'stdout', data: msg }) });
    pyodide.setStderr({ batched: (msg) => self.postMessage({ type: 'stderr', data: msg }) });
    return pyodide;
  })();
  return pyodideReady;
}

self.onmessage = async (event) => {
  const { type, code, id } = event.data || {};
  if (type === 'init') {
    try {
      await ensurePyodide();
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'stderr', data: String(err) });
    }
    return;
  }
  if (type === 'run') {
    try {
      const pyodide = await ensurePyodide();
      await pyodide.runPythonAsync(code);
      self.postMessage({ type: 'done', id });
    } catch (err) {
      self.postMessage({ type: 'stderr', data: String(err) });
      self.postMessage({ type: 'done', id });
    }
  }
};
`;

type OutputKind = 'stdout' | 'stderr' | 'system';
interface OutputLine {
  id: number;
  kind: OutputKind;
  text: string;
}

export function PythonRunner() {
  const t = useTranslations('python');
  const { unlock } = useAchievements();
  const [code, setCode] = useState<string>(FIBONACCI_EXAMPLE);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const { type, data } = event.data as { type: string; data?: string };
      if (type === 'ready') {
        setReady(true);
        setOutput((prev) => [
          ...prev,
          { id: idRef.current++, kind: 'system', text: t('ready') }
        ]);
      } else if (type === 'stdout' && typeof data === 'string') {
        setOutput((prev) => [...prev, { id: idRef.current++, kind: 'stdout', text: data }]);
      } else if (type === 'stderr' && typeof data === 'string') {
        setOutput((prev) => [...prev, { id: idRef.current++, kind: 'stderr', text: data }]);
      } else if (type === 'done') {
        setRunning(false);
      }
    };

    setOutput([{ id: idRef.current++, kind: 'system', text: t('loading') }]);
    worker.postMessage({ type: 'init' });

    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  }, [t]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  function run(): void {
    if (!ready || !workerRef.current) return;
    setRunning(true);
    unlock('pythonista');
    workerRef.current.postMessage({ type: 'run', code, id: idRef.current++ });
  }

  function clear(): void {
    setOutput([]);
  }

  function reset(): void {
    setCode(FIBONACCI_EXAMPLE);
  }

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border bg-black/5 px-2.5 py-1 text-xs dark:bg-white/10"
          aria-live="polite"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              ready ? 'bg-accent' : 'bg-yellow-400 animate-pulse'
            }`}
          />
          {ready ? t('ready') : t('loading')}
        </span>
      </header>

      <label htmlFor="py-code" className="sr-only">
        Python source
      </label>
      <textarea
        id="py-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        className="mt-4 h-32 w-full resize-none rounded-xl border bg-black/90 p-3 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:ring-2 focus:ring-primary"
      />

      <div
        ref={terminalRef}
        role="log"
        aria-live="polite"
        className="scrollbar-thin mt-3 h-40 flex-1 overflow-auto rounded-xl border bg-black p-3 font-mono text-xs leading-relaxed"
      >
        {output.map((line) => (
          <p
            key={line.id}
            className={
              line.kind === 'stderr'
                ? 'whitespace-pre-wrap text-red-400'
                : line.kind === 'system'
                ? 'whitespace-pre-wrap text-yellow-300'
                : 'whitespace-pre-wrap text-emerald-300'
            }
          >
            {line.text}
          </p>
        ))}
        <p className="text-emerald-300">
          <span className="text-emerald-500">{'>'}&nbsp;</span>
          <span aria-hidden="true" className="inline-block h-3 w-2 animate-blink bg-emerald-300 align-middle" />
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={run}
          disabled={!ready || running}
          className="btn-primary disabled:opacity-50"
        >
          {running ? '...' : t('run')}
        </button>
        <button type="button" onClick={clear} className="btn-ghost">
          {t('clear')}
        </button>
        <button type="button" onClick={reset} className="btn-ghost">
          {t('reset')}
        </button>
      </div>
    </article>
  );
}
