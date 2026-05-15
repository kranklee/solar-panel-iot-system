// Lane based Age of War style strategy game with wave spawning and base health
// Player spawns soldiers archers and tanks with gold and tries to destroy the enemy base
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface AgeOfWarGameProps {
  onGameOver: (score: number) => void;
}

type UnitKind = 'soldier' | 'archer' | 'tank';

interface Unit {
  id: number;
  x: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  range: number;
  side: 'player' | 'enemy';
  kind: UnitKind;
  cooldown: number;
}

interface UnitStats {
  cost: number;
  hp: number;
  damage: number;
  speed: number;
  range: number;
  color: string;
}

const STATS: Record<UnitKind, UnitStats> = {
  soldier: { cost: 10, hp: 30, damage: 5, speed: 0.6, range: 14, color: '#6366f1' },
  archer: { cost: 20, hp: 20, damage: 8, speed: 0.8, range: 60, color: '#34d399' },
  tank: { cost: 50, hp: 80, damage: 12, speed: 0.4, range: 18, color: '#f59e0b' }
};

const WIDTH = 640;
const HEIGHT = 220;
const PLAYER_BASE_X = 30;
const ENEMY_BASE_X = WIDTH - 30;
const BASE_MAX_HP = 100;

export function AgeOfWarGame({ onGameOver }: AgeOfWarGameProps) {
  const t = useTranslations('games');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unitsRef = useRef<Unit[]>([]);
  const idRef = useRef(0);
  const playerHpRef = useRef(BASE_MAX_HP);
  const enemyHpRef = useRef(BASE_MAX_HP);
  const goldRef = useRef(30);
  const waveRef = useRef(1);
  const enemySpawnRef = useRef(0);
  const goldTickRef = useRef(0);
  const overRef = useRef<null | 'win' | 'lose'>(null);

  const [gold, setGold] = useState(30);
  const [wave, setWave] = useState(1);
  const [playerHp, setPlayerHp] = useState(BASE_MAX_HP);
  const [enemyHp, setEnemyHp] = useState(BASE_MAX_HP);
  const [outcome, setOutcome] = useState<null | 'win' | 'lose'>(null);

  const reset = useCallback((): void => {
    unitsRef.current = [];
    idRef.current = 0;
    playerHpRef.current = BASE_MAX_HP;
    enemyHpRef.current = BASE_MAX_HP;
    goldRef.current = 30;
    waveRef.current = 1;
    enemySpawnRef.current = 0;
    goldTickRef.current = 0;
    overRef.current = null;
    setGold(30);
    setWave(1);
    setPlayerHp(BASE_MAX_HP);
    setEnemyHp(BASE_MAX_HP);
    setOutcome(null);
  }, []);

  const spawn = useCallback((kind: UnitKind): void => {
    if (overRef.current) return;
    const stats = STATS[kind];
    if (goldRef.current < stats.cost) return;
    goldRef.current -= stats.cost;
    setGold(goldRef.current);
    idRef.current += 1;
    unitsRef.current.push({
      id: idRef.current,
      x: PLAYER_BASE_X + 20,
      hp: stats.hp,
      maxHp: stats.hp,
      damage: stats.damage,
      speed: stats.speed,
      range: stats.range,
      side: 'player',
      kind,
      cooldown: 0
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    let raf = 0;

    function spawnEnemyWave(): void {
      const kinds: UnitKind[] = ['soldier'];
      if (waveRef.current >= 2) kinds.push('archer');
      if (waveRef.current >= 4) kinds.push('tank');
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const stats = STATS[kind];
      const hpBonus = 1 + waveRef.current * 0.1;
      idRef.current += 1;
      unitsRef.current.push({
        id: idRef.current,
        x: ENEMY_BASE_X - 20,
        hp: stats.hp * hpBonus,
        maxHp: stats.hp * hpBonus,
        damage: stats.damage,
        speed: stats.speed,
        range: stats.range,
        side: 'enemy',
        kind,
        cooldown: 0
      });
    }

    function step(): void {
      if (!overRef.current) {
        goldTickRef.current += 1;
        if (goldTickRef.current >= 36) {
          goldTickRef.current = 0;
          goldRef.current = Math.min(999, goldRef.current + 1);
          setGold(goldRef.current);
        }
        enemySpawnRef.current += 1;
        const spawnEvery = Math.max(80, 240 - waveRef.current * 10);
        if (enemySpawnRef.current >= spawnEvery) {
          enemySpawnRef.current = 0;
          spawnEnemyWave();
          if (Math.random() < 0.3) {
            waveRef.current += 1;
            setWave(waveRef.current);
          }
        }

        for (const unit of unitsRef.current) {
          const enemies = unitsRef.current.filter(
            (other) => other.side !== unit.side && other.hp > 0
          );
          const target = enemies.reduce<Unit | null>((closest, candidate) => {
            const distance = Math.abs(candidate.x - unit.x);
            if (distance > unit.range + 6) return closest;
            if (!closest) return candidate;
            return distance < Math.abs(closest.x - unit.x) ? candidate : closest;
          }, null);

          if (target) {
            if (unit.cooldown <= 0) {
              target.hp -= unit.damage;
              unit.cooldown = 30;
            } else {
              unit.cooldown -= 1;
            }
          } else {
            unit.x += unit.side === 'player' ? unit.speed : -unit.speed;
          }
        }

        unitsRef.current = unitsRef.current.filter((unit) => unit.hp > 0);

        for (const unit of unitsRef.current) {
          if (unit.side === 'player' && unit.x >= ENEMY_BASE_X - 8) {
            enemyHpRef.current -= unit.damage * 0.2;
            unit.hp = 0;
          } else if (unit.side === 'enemy' && unit.x <= PLAYER_BASE_X + 8) {
            playerHpRef.current -= unit.damage * 0.2;
            unit.hp = 0;
          }
        }
        unitsRef.current = unitsRef.current.filter((unit) => unit.hp > 0);

        setPlayerHp(Math.max(0, Math.round(playerHpRef.current)));
        setEnemyHp(Math.max(0, Math.round(enemyHpRef.current)));

        if (enemyHpRef.current <= 0) {
          overRef.current = 'win';
          setOutcome('win');
          onGameOver(Math.round(waveRef.current * 100 + Math.max(0, playerHpRef.current)));
        } else if (playerHpRef.current <= 0) {
          overRef.current = 'lose';
          setOutcome('lose');
          onGameOver(Math.round(waveRef.current * 50));
        }
      }

      ctx.fillStyle = '#0b0f1a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(0, HEIGHT - 30);
      ctx.lineTo(WIDTH, HEIGHT - 30);
      ctx.stroke();

      ctx.fillStyle = '#6366f1';
      ctx.fillRect(PLAYER_BASE_X - 20, HEIGHT - 70, 30, 50);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ENEMY_BASE_X - 10, HEIGHT - 70, 30, 50);

      for (const unit of unitsRef.current) {
        ctx.fillStyle = unit.side === 'player' ? STATS[unit.kind].color : '#fb7185';
        ctx.fillRect(unit.x - 5, HEIGHT - 50, 10, 24);
        const ratio = Math.max(0, unit.hp / unit.maxHp);
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(unit.x - 8, HEIGHT - 58, 16, 3);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(unit.x - 8, HEIGHT - 58, 16 * ratio, 3);
      }

      raf = window.requestAnimationFrame(step);
    }

    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [onGameOver]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex items-center justify-between gap-2 bg-black/70 px-3 py-2 font-mono text-xs text-white">
        <span>
          {t('gold')}: <span className="text-amber-300">{gold}</span>
        </span>
        <span>
          {t('wave')}: <span className="text-emerald-300">{wave}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-indigo-300">{playerHp}</span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full bg-indigo-400"
              style={{ width: `${(playerHp / BASE_MAX_HP) * 100}%` }}
            />
          </span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full bg-rose-400"
              style={{ width: `${(enemyHp / BASE_MAX_HP) * 100}%` }}
            />
          </span>
          <span className="text-rose-300">{enemyHp}</span>
        </span>
      </div>

      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label={t('ageofwar')}
          className="block h-full w-full"
        />
        {outcome && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
            <p className="text-2xl font-semibold">
              {outcome === 'win' ? t('youWin') : t('youLose')}
            </p>
            <button type="button" onClick={reset} className="btn-primary mt-4">
              {t('restart')}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 bg-black/70 px-3 py-2">
        <button
          type="button"
          onClick={() => spawn('soldier')}
          disabled={gold < STATS.soldier.cost || !!outcome}
          className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 disabled:opacity-40"
        >
          {t('spawnSoldier')} ({STATS.soldier.cost})
        </button>
        <button
          type="button"
          onClick={() => spawn('archer')}
          disabled={gold < STATS.archer.cost || !!outcome}
          className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 disabled:opacity-40"
        >
          {t('spawnArcher')} ({STATS.archer.cost})
        </button>
        <button
          type="button"
          onClick={() => spawn('tank')}
          disabled={gold < STATS.tank.cost || !!outcome}
          className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 disabled:opacity-40"
        >
          {t('spawnTank')} ({STATS.tank.cost})
        </button>
        <span className="ml-auto self-center font-mono text-[10px] text-white/60">
          {t('ageofwarControls')}
        </span>
      </div>
    </div>
  );
}
