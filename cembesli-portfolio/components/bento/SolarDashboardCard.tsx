// Live solar panel dashboard card with simulated readings that mirror the IoT pipeline
// Renders a sparkline plus stats and a weather indicator updated on a real time interval
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type Weather = 'Clear' | 'Partly Cloudy' | 'Overcast' | 'Foggy';

interface Reading {
  t: number;
  power: number;
  weather: Weather;
}

const WEATHER_RANGE: Record<Weather, [number, number]> = {
  Clear: [0.85, 1.0],
  'Partly Cloudy': [0.55, 0.75],
  Overcast: [0.2, 0.4],
  Foggy: [0.05, 0.18]
};
const WEATHER_OPTIONS: Weather[] = ['Clear', 'Partly Cloudy', 'Overcast', 'Foggy'];
const WEATHER_WEIGHTS = [0.4, 0.3, 0.2, 0.1];
const PEAK_WATTS = 400;
const HISTORY_LIMIT = 60;

function pickWeather(): Weather {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < WEATHER_OPTIONS.length; i += 1) {
    acc += WEATHER_WEIGHTS[i];
    if (r <= acc) return WEATHER_OPTIONS[i];
  }
  return 'Clear';
}

function buildSimulator() {
  let step = 0;
  const totalSteps = 240;
  let weather: Weather = 'Clear';
  let remaining = 8 + Math.floor(Math.random() * 5);

  return function next(): Reading {
    const phase = (step % totalSteps) / totalSteps;
    let dayArc = Math.max(0, Math.sin(Math.PI * phase));
    const [lo, hi] = WEATHER_RANGE[weather];
    const factor = lo + Math.random() * (hi - lo);
    dayArc *= factor;
    const noise = (Math.random() - 0.5) * 0.04;
    const result = Math.max(0, Math.min(1, dayArc + noise));
    const power = Math.round(result * PEAK_WATTS * 100) / 100;
    step += 1;
    remaining -= 1;
    if (remaining <= 0) {
      weather = pickWeather();
      remaining = 6 + Math.floor(Math.random() * 8);
    }
    return { t: Date.now(), power, weather };
  };
}

const WEATHER_COLOR: Record<Weather, string> = {
  Clear: '#fbbf24',
  'Partly Cloudy': '#60a5fa',
  Overcast: '#94a3b8',
  Foggy: '#64748b'
};

export function SolarDashboardCard() {
  const t = useTranslations('dashboard');
  const [readings, setReadings] = useState<Reading[]>([]);
  const simulatorRef = useRef<ReturnType<typeof buildSimulator> | null>(null);

  useEffect(() => {
    simulatorRef.current = buildSimulator();
    const seed: Reading[] = [];
    for (let i = 0; i < 20; i += 1) {
      seed.push(simulatorRef.current());
    }
    setReadings(seed);

    const interval = window.setInterval(() => {
      if (!simulatorRef.current) return;
      setReadings((prev) => {
        const next = [...prev, simulatorRef.current!()].slice(-HISTORY_LIMIT);
        return next;
      });
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    if (readings.length === 0) {
      return { current: 0, peak: 0, average: 0, weather: 'Clear' as Weather };
    }
    const current = readings[readings.length - 1];
    const peak = readings.reduce((max, r) => (r.power > max ? r.power : max), 0);
    const average = readings.reduce((sum, r) => sum + r.power, 0) / readings.length;
    return { current: current.power, peak, average, weather: current.weather };
  }, [readings]);

  const sparkline = useMemo(() => {
    if (readings.length < 2) return '';
    const w = 320;
    const h = 80;
    const max = Math.max(PEAK_WATTS, ...readings.map((r) => r.power));
    return readings
      .map((reading, index) => {
        const x = (index / (readings.length - 1)) * w;
        const y = h - (reading.power / max) * h;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [readings]);

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
        </div>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          {t('panels')}
        </Link>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="text-[10px] uppercase tracking-widest text-foreground/50">
            {t('power')}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-primary">
            {stats.current.toFixed(1)}
          </p>
          <p className="text-[10px] text-foreground/50">{t('watts')}</p>
        </div>
        <div className="rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="text-[10px] uppercase tracking-widest text-foreground/50">{t('peak')}</p>
          <p className="mt-1 font-mono text-2xl font-semibold">{stats.peak.toFixed(1)}</p>
          <p className="text-[10px] text-foreground/50">{t('watts')}</p>
        </div>
        <div className="rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.03]">
          <p className="text-[10px] uppercase tracking-widest text-foreground/50">
            {t('average')}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold">{stats.average.toFixed(1)}</p>
          <p className="text-[10px] text-foreground/50">{t('watts')}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: WEATHER_COLOR[stats.weather] }}
          />
          {t('weather')}: <strong className="font-semibold">{stats.weather}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-foreground/50 dark:text-bg/50">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          live
        </span>
      </div>

      <div className="mt-3 flex-1 overflow-hidden rounded-2xl border bg-black/[0.02] p-2 dark:bg-white/[0.03]">
        <p className="px-2 pt-1 text-[10px] uppercase tracking-widest text-foreground/40">
          {t('history')}
        </p>
        <svg
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          className="mt-1 h-[80px] w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="solar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {sparkline && (
            <>
              <path d={`${sparkline} L 320 80 L 0 80 Z`} fill="url(#solar-gradient)" />
              <path d={sparkline} fill="none" stroke="#6366f1" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </div>
    </article>
  );
}
