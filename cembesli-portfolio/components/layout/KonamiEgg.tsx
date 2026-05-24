// Listens for the classic Konami code and unlocks the Secret Agent achievement
// Triggers a brief celebratory overlay so visitors notice the easter egg fired
'use client';

import { useEffect, useState } from 'react';
import { useAchievements } from '@/components/providers/AchievementsProvider';

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export function KonamiEgg() {
  const { unlock } = useAchievements();
  const [active, setActive] = useState(false);

  useEffect(() => {
    let buffer: string[] = [];
    function onKey(event: KeyboardEvent): void {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      buffer = [...buffer, key].slice(-SEQUENCE.length);
      if (buffer.join(',') === SEQUENCE.join(',')) {
        unlock('secret');
        setActive(true);
        window.setTimeout(() => setActive(false), 1800);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlock]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[140] flex items-center justify-center"
    >
      <div className="animate-fade-up rounded-card border bg-card/95 px-8 py-6 text-center shadow-lift dark:bg-card-dark/95">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">unlocked</p>
        <p className="mt-1 text-3xl font-semibold">Secret Agent</p>
      </div>
    </div>
  );
}
