// Canvas based Starblast clone with vector physics, sound effects, and touch controls
// Reports the final score to the parent through onGameOver when the ship is destroyed
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { TouchControls } from './TouchControls';
import { blip, chord } from '@/lib/sound';
import { useAchievements } from '@/components/providers/AchievementsProvider';

interface StarblastGameProps {
  onGameOver: (score: number) => void;
}

interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const WIDTH = 640;
const HEIGHT = 360;
const THRUST = 0.08;
const ROTATE = 0.06;
const DRAG = 0.99;
const BULLET_SPEED = 5;
const BULLET_LIFE = 70;
const ASTEROID_SPAWN_FRAMES = 90;
const BEST_KEY = 'cembesli.best.starblast';

function createShip(): Ship {
  return { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, angle: -Math.PI / 2, radius: 10 };
}

function wrap(value: number, max: number): number {
  if (value < 0) return value + max;
  if (value > max) return value - max;
  return value;
}

function spawnAsteroid(): Asteroid {
  const edge = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  if (edge === 0) {
    x = Math.random() * WIDTH;
    y = -20;
  } else if (edge === 1) {
    x = WIDTH + 20;
    y = Math.random() * HEIGHT;
  } else if (edge === 2) {
    x = Math.random() * WIDTH;
    y = HEIGHT + 20;
  } else {
    x = -20;
    y = Math.random() * HEIGHT;
  }
  const angle = Math.atan2(HEIGHT / 2 - y, WIDTH / 2 - x) + (Math.random() - 0.5) * 0.6;
  const speed = 0.5 + Math.random() * 1.2;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 14 + Math.random() * 18
  };
}

export function StarblastGame({ onGameOver }: StarblastGameProps) {
  const t = useTranslations('games');
  const { unlock } = useAchievements();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const shipRef = useRef<Ship>(createShip());
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const frameRef = useRef(0);
  const cooldownRef = useRef(0);
  const scoreRef = useRef(0);
  const overRef = useRef(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BEST_KEY);
      if (stored) setBest(parseInt(stored, 10) || 0);
    } catch {
      // ignore
    }
  }, []);

  const press = useCallback((key: string) => {
    keysRef.current.add(key.toLowerCase());
  }, []);
  const release = useCallback((key: string) => {
    keysRef.current.delete(key.toLowerCase());
  }, []);

  const reset = useCallback((): void => {
    shipRef.current = createShip();
    bulletsRef.current = [];
    asteroidsRef.current = [];
    frameRef.current = 0;
    cooldownRef.current = 0;
    scoreRef.current = 0;
    overRef.current = false;
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    function down(event: KeyboardEvent): void {
      keysRef.current.add(event.key.toLowerCase());
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(event.key.toLowerCase())
      ) {
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    let raf = 0;

    function step(): void {
      const keys = keysRef.current;
      const ship = shipRef.current;
      if (!overRef.current) {
        if (keys.has('arrowleft') || keys.has('a')) ship.angle -= ROTATE;
        if (keys.has('arrowright') || keys.has('d')) ship.angle += ROTATE;
        if (keys.has('arrowup') || keys.has('w')) {
          ship.vx += Math.cos(ship.angle) * THRUST;
          ship.vy += Math.sin(ship.angle) * THRUST;
        }
        if (keys.has('arrowdown') || keys.has('s')) {
          ship.vx -= Math.cos(ship.angle) * THRUST * 0.5;
          ship.vy -= Math.sin(ship.angle) * THRUST * 0.5;
        }
        ship.vx *= DRAG;
        ship.vy *= DRAG;
        ship.x = wrap(ship.x + ship.vx, WIDTH);
        ship.y = wrap(ship.y + ship.vy, HEIGHT);

        if (cooldownRef.current > 0) cooldownRef.current -= 1;
        if (keys.has(' ') && cooldownRef.current <= 0) {
          bulletsRef.current.push({
            x: ship.x + Math.cos(ship.angle) * ship.radius,
            y: ship.y + Math.sin(ship.angle) * ship.radius,
            vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx,
            vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy,
            life: BULLET_LIFE
          });
          cooldownRef.current = 10;
          blip(880, 0.05, 'square');
        }

        bulletsRef.current = bulletsRef.current.filter((bullet) => {
          bullet.x = wrap(bullet.x + bullet.vx, WIDTH);
          bullet.y = wrap(bullet.y + bullet.vy, HEIGHT);
          bullet.life -= 1;
          return bullet.life > 0;
        });

        frameRef.current += 1;
        if (frameRef.current % ASTEROID_SPAWN_FRAMES === 0) {
          asteroidsRef.current.push(spawnAsteroid());
        }

        const remaining: Asteroid[] = [];
        for (const asteroid of asteroidsRef.current) {
          asteroid.x = wrap(asteroid.x + asteroid.vx, WIDTH);
          asteroid.y = wrap(asteroid.y + asteroid.vy, HEIGHT);
          let hit = false;
          for (let i = 0; i < bulletsRef.current.length; i += 1) {
            const bullet = bulletsRef.current[i];
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            if (dx * dx + dy * dy < asteroid.radius * asteroid.radius) {
              hit = true;
              bulletsRef.current.splice(i, 1);
              scoreRef.current += 10;
              setScore(scoreRef.current);
              blip(220, 0.12, 'sawtooth');
              break;
            }
          }
          if (!hit) {
            const dx = ship.x - asteroid.x;
            const dy = ship.y - asteroid.y;
            if (
              dx * dx + dy * dy <
              (ship.radius + asteroid.radius) * (ship.radius + asteroid.radius)
            ) {
              overRef.current = true;
              setGameOver(true);
              chord([110, 82, 55], 0.3);
              unlock('gamer');
              setBest((current) => {
                const next = Math.max(current, scoreRef.current);
                try {
                  window.localStorage.setItem(BEST_KEY, String(next));
                } catch {
                  // ignore
                }
                return next;
              });
              onGameOver(scoreRef.current);
            } else {
              remaining.push(asteroid);
            }
          }
        }
        asteroidsRef.current = remaining;
      }

      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 60; i += 1) {
        const sx = (i * 97) % WIDTH;
        const sy = (i * 53) % HEIGHT;
        ctx.fillRect(sx, sy, 1, 1);
      }

      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = overRef.current ? '#f87171' : '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, 7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-8, -7);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#34d399';
      for (const bullet of bulletsRef.current) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (const asteroid of asteroidsRef.current) {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = window.requestAnimationFrame(step);
    }

    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [onGameOver, unlock]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        aria-label={t('starblast')}
        className="block h-full w-full"
      />
      <div className="pointer-events-none absolute left-3 top-3 flex gap-3 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-emerald-300">
        <span>
          {t('score')}: {score}
        </span>
        <span className="text-foreground/60">
          {t('bestScore')}: {best}
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[10px] text-white/60">
        {t('starblastControls')}
      </p>
      <TouchControls onPress={press} onRelease={release} actionLabel={t('fire')} />
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <p className="text-2xl font-semibold">{t('gameOver')}</p>
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
