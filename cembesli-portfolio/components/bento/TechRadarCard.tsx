// Quadrant tech radar showing where I stand on each tool
// Pure SVG so there is no chart library and the bundle stays lean
'use client';

import { useTranslations } from 'next-intl';

type Ring = 'adopt' | 'trial' | 'assess' | 'hold';

interface Item {
  label: string;
  ring: Ring;
  angle: number;
}

const RING_RADIUS: Record<Ring, number> = {
  adopt: 32,
  trial: 60,
  assess: 90,
  hold: 118
};

const RING_COLOR: Record<Ring, string> = {
  adopt: '#34d399',
  trial: '#6366f1',
  assess: '#f59e0b',
  hold: '#ef4444'
};

const ITEMS: Item[] = [
  { label: 'TypeScript', ring: 'adopt', angle: 20 },
  { label: 'Next.js', ring: 'adopt', angle: 60 },
  { label: 'Supabase', ring: 'adopt', angle: 110 },
  { label: 'Tailwind', ring: 'adopt', angle: 160 },
  { label: 'Pyodide', ring: 'trial', angle: 40 },
  { label: 'tRPC', ring: 'trial', angle: 95 },
  { label: 'Drizzle', ring: 'trial', angle: 140 },
  { label: 'WebGPU', ring: 'assess', angle: 30 },
  { label: 'Bun', ring: 'assess', angle: 80 },
  { label: 'Server Actions', ring: 'assess', angle: 130 },
  { label: 'CRA', ring: 'hold', angle: 50 },
  { label: 'Redux', ring: 'hold', angle: 110 }
];

const CENTER = 130;

function polar(angle: number, radius: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(rad) * radius,
    y: CENTER + Math.sin(rad) * radius
  };
}

export function TechRadarCard() {
  const t = useTranslations('radar');

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-[260px_1fr]">
        <svg viewBox="0 0 260 260" aria-label={t('title')} className="w-full">
          {(['hold', 'assess', 'trial', 'adopt'] as Ring[]).map((ring) => (
            <circle
              key={ring}
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS[ring]}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeDasharray="2 3"
            />
          ))}
          <line x1={CENTER} y1={10} x2={CENTER} y2={250} stroke="currentColor" strokeOpacity="0.15" />
          <line x1={10} y1={CENTER} x2={250} y2={CENTER} stroke="currentColor" strokeOpacity="0.15" />
          {ITEMS.map((item) => {
            const { x, y } = polar(item.angle, RING_RADIUS[item.ring] - 8);
            return (
              <g key={item.label}>
                <circle cx={x} cy={y} r="4.5" fill={RING_COLOR[item.ring]} />
                <text
                  x={x + 8}
                  y={y + 3}
                  fontSize="9"
                  fill="currentColor"
                  fillOpacity="0.8"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        <dl className="space-y-2 text-xs">
          {(['adopt', 'trial', 'assess', 'hold'] as Ring[]).map((ring) => (
            <div
              key={ring}
              className="flex items-start gap-2 rounded-2xl border bg-black/[0.02] p-2 dark:bg-white/[0.03]"
            >
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: RING_COLOR[ring] }}
              />
              <div>
                <dt className="font-semibold uppercase tracking-wider">{t(ring)}</dt>
                <dd className="text-foreground/60 dark:text-bg/60">
                  {ITEMS.filter((item) => item.ring === ring)
                    .map((item) => item.label)
                    .join(', ')}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
