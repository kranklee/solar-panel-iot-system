// Top down drone simulator with wind physics and ordered waypoint collection
// Score is derived from remaining time when the final waypoint is reached
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatTime } from '@/lib/utils';

interface DroneSimGameProps {
  onGameOver: (score: number) => void;
}

interface Drone {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Waypoint {
  x: number;
  y: number;
}

const WIDTH = 640;
const HEIGHT = 320;
const ACCEL = 0.18;
const DRAG = 0.96;
const WAYPOINTS: Waypoint[] = [
  { x: 110, y: 80 },
  { x: 520, y: 70 },
  { x: 540, y: 240 },
  { x: 320, y: 170 },
  { x: 100, y: 250 }
];

function createDrone(): Drone {
  return { x: 60, y: 60, vx: 0, vy: 0 };
}

function randomWind(): { wx: number; wy: number } {
  return { wx: (Math.random() - 0.5) * 0.18, wy: (Math.random() - 0.5) * 0.18 };
}

export function DroneSimGame({ onGameOver }: DroneSimGameProps) {
  const t = useTranslations('games');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const droneRef = useRef<Drone>(createDrone());
  const keysRef = useRef<Set<string>>(new Set());
  const windRef = useRef(randomWind());
  const targetRef = useRef(0);
  const startedRef = useRef<number | null>(null);
  const overRef = useRef(false);

  const [targetIndex, setTargetIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const reset = useCallback((): void => {
    droneRef.current = createDrone();
    windRef.current = randomWind();
    targetRef.current = 0;
    startedRef.current = null;
    overRef.current = false;
    setTargetIndex(0);
    setElapsed(0);
    setDone(false);
    setScore(0);
  }, []);

  useEffect(() => {
    function down(event: KeyboardEvent): void {
      keysRef.current.add(event.key.toLowerCase());
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(
        event.key.toLowerCase()
      )) {
        event.preventDefault();
      }
    }
    function up(event: KeyboardEvent): void {
      keysRef.current.delete(event.key.toLowerCase());
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      windRef.current = randomWind();
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    let raf = 0;

    function step(): void {
      const drone = droneRef.current;
      const keys = keysRef.current;

      if (!overRef.current) {
        const hasInput =
          keys.has('w') ||
          keys.has('a') ||
          keys.has('s') ||
          keys.has('d') ||
          keys.has('arrowup') ||
          keys.has('arrowdown') ||
          keys.has('arrowleft') ||
          keys.has('arrowright');
        if (hasInput && startedRef.current === null) {
          startedRef.current = performance.now();
        }
        if (keys.has('w') || keys.has('arrowup')) drone.vy -= ACCEL;
        if (keys.has('s') || keys.has('arrowdown')) drone.vy += ACCEL;
        if (keys.has('a') || keys.has('arrowleft')) drone.vx -= ACCEL;
        if (keys.has('d') || keys.has('arrowright')) drone.vx += ACCEL;

        const wind = windRef.current;
        drone.vx = (drone.vx + wind.wx) * DRAG;
        drone.vy = (drone.vy + wind.wy) * DRAG;
        drone.x = Math.max(8, Math.min(WIDTH - 8, drone.x + drone.vx));
        drone.y = Math.max(8, Math.min(HEIGHT - 8, drone.y + drone.vy));

        const target = WAYPOINTS[targetRef.current];
        const dx = target.x - drone.x;
        const dy = target.y - drone.y;
        if (dx * dx + dy * dy < 18 * 18) {
          targetRef.current += 1;
          setTargetIndex(targetRef.current);
          if (targetRef.current >= WAYPOINTS.length) {
            const elapsedMs = startedRef.current ? performance.now() - startedRef.current : 0;
            const final = Math.max(0, Math.floor((60_000 - elapsedMs) / 100));
            overRef.current = true;
            setScore(final);
            setDone(true);
            onGameOver(final);
          }
        }

        if (startedRef.current !== null) {
          setElapsed(performance.now() - startedRef.current);
        }
      }

      ctx.fillStyle = '#040611';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      for (let i = 0; i < WIDTH; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, HEIGHT);
        ctx.stroke();
      }
      for (let j = 0; j < HEIGHT; j += 32) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(WIDTH, j);
        ctx.stroke();
      }

      WAYPOINTS.forEach((waypoint, index) => {
        const isCurrent = index === targetRef.current;
        const isCollected = index < targetRef.current;
        ctx.beginPath();
        ctx.arc(waypoint.x, waypoint.y, isCurrent ? 14 : 10, 0, Math.PI * 2);
        ctx.strokeStyle = isCollected ? '#475569' : isCurrent ? '#34d399' : '#6366f1';
        ctx.lineWidth = isCurrent ? 2.5 : 1.5;
        ctx.stroke();
        ctx.fillStyle = isCurrent ? '#34d39933' : 'transparent';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText((index + 1).toString(), waypoint.x - 3, waypoint.y + 3);
      });

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0b0f1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drone.x - 10, drone.y);
      ctx.lineTo(drone.x + 10, drone.y);
      ctx.moveTo(drone.x, drone.y - 10);
      ctx.lineTo(drone.x, drone.y + 10);
      ctx.stroke();

      const wind = windRef.current;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(WIDTH - 40, 20);
      ctx.lineTo(WIDTH - 40 + wind.wx * 200, 20 + wind.wy * 200);
      ctx.stroke();

      raf = window.requestAnimationFrame(step);
    }

    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [onGameOver]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        aria-label={t('dronesim')}
        className="block h-full w-full"
      />
      <div className="pointer-events-none absolute left-3 top-3 flex gap-3 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-emerald-300">
        <span>
          {t('waypoint')}: {Math.min(targetIndex + 1, WAYPOINTS.length)}/{WAYPOINTS.length}
        </span>
        <span>
          {t('time')}: {formatTime(elapsed)}
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[10px] text-white/60">
        {t('dronesimControls')}
      </p>
      {done && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <p className="text-2xl font-semibold">{t('youWin')}</p>
          <p className="mt-1 font-mono text-sm">
            {t('score')}: {score}
          </p>
          <button type="button" onClick={reset} className="btn-primary mt-4">
            {t('restart')}
          </button>
        </div>
      )}
    </div>
  );
}
