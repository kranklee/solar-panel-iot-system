// Reusable on-screen joystick and action button for mobile gameplay
// Reports the same key strings that the desktop keyboard handlers expect
'use client';

import { useEffect, useRef, useState } from 'react';

interface TouchControlsProps {
  onPress: (key: string) => void;
  onRelease: (key: string) => void;
  actionLabel?: string;
}

export function TouchControls({ onPress, onRelease, actionLabel }: TouchControlsProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());
  const [knob, setKnob] = useState({ dx: 0, dy: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(typeof window !== 'undefined' && 'ontouchstart' in window);
  }, []);

  function releaseAll(): void {
    activeKeysRef.current.forEach((key) => onRelease(key));
    activeKeysRef.current.clear();
    setKnob({ dx: 0, dy: 0 });
  }

  function updateFromPoint(clientX: number, clientY: number): void {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const max = rect.width / 2 - 12;
    const length = Math.hypot(dx, dy) || 1;
    const clampedX = (dx / length) * Math.min(length, max);
    const clampedY = (dy / length) * Math.min(length, max);
    setKnob({ dx: clampedX, dy: clampedY });

    const desired = new Set<string>();
    if (clampedX > max * 0.3) desired.add('d');
    if (clampedX < -max * 0.3) desired.add('a');
    if (clampedY > max * 0.3) desired.add('s');
    if (clampedY < -max * 0.3) desired.add('w');

    activeKeysRef.current.forEach((key) => {
      if (!desired.has(key)) {
        onRelease(key);
        activeKeysRef.current.delete(key);
      }
    });
    desired.forEach((key) => {
      if (!activeKeysRef.current.has(key)) {
        onPress(key);
        activeKeysRef.current.add(key);
      }
    });
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-end justify-between px-4">
      <div
        ref={padRef}
        onTouchStart={(event) => {
          const t = event.touches[0];
          updateFromPoint(t.clientX, t.clientY);
        }}
        onTouchMove={(event) => {
          const t = event.touches[0];
          updateFromPoint(t.clientX, t.clientY);
        }}
        onTouchEnd={releaseAll}
        onTouchCancel={releaseAll}
        className="pointer-events-auto relative h-28 w-28 rounded-full border border-white/30 bg-white/10 backdrop-blur"
        aria-label="Joystick"
        role="presentation"
      >
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 transition-transform"
          style={{ transform: `translate(calc(-50% + ${knob.dx}px), calc(-50% + ${knob.dy}px))` }}
        />
      </div>

      <button
        type="button"
        onTouchStart={() => {
          activeKeysRef.current.add(' ');
          onPress(' ');
        }}
        onTouchEnd={() => {
          activeKeysRef.current.delete(' ');
          onRelease(' ');
        }}
        className="pointer-events-auto h-20 w-20 rounded-full border border-primary/60 bg-primary/30 text-sm font-semibold text-white backdrop-blur"
      >
        {actionLabel ?? 'Fire'}
      </button>
    </div>
  );
}
