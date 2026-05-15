// Architecture case study card featuring an inline SVG data flow diagram
// Pure CSS and SVG so no third party charting library is required
'use client';

import { useTranslations } from 'next-intl';

const LAYERS = [
  { key: 'frontend', x: 40, color: '#6366f1' },
  { key: 'api', x: 180, color: '#34d399' },
  { key: 'database', x: 320, color: '#f59e0b' },
  { key: 'deployment', x: 460, color: '#ec4899' }
] as const;

export function ArchitectureCard() {
  const t = useTranslations('architecture');

  return (
    <article className="bento-card flex h-full flex-col p-6">
      <header>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-foreground/60 dark:text-bg/60">{t('subtitle')}</p>
      </header>

      <div className="mt-4 overflow-x-auto">
        <svg
          role="img"
          aria-label={t('title')}
          viewBox="0 0 600 160"
          className="w-full min-w-[560px]"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
            </marker>
          </defs>
          {LAYERS.map((layer, index) => (
            <g key={layer.key}>
              <rect
                x={layer.x}
                y="40"
                width="100"
                height="80"
                rx="14"
                fill={`${layer.color}22`}
                stroke={layer.color}
                strokeWidth="1.5"
              />
              <text
                x={layer.x + 50}
                y="80"
                textAnchor="middle"
                className="fill-current font-semibold"
                fontSize="13"
              >
                {t(layer.key)}
              </text>
              <text
                x={layer.x + 50}
                y="100"
                textAnchor="middle"
                fontSize="10"
                fill={layer.color}
              >
                Layer {index + 1}
              </text>
              {index < LAYERS.length - 1 && (
                <line
                  x1={layer.x + 100}
                  y1="80"
                  x2={LAYERS[index + 1].x}
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrowhead)"
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      <dl className="mt-5 grid flex-1 grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {LAYERS.map((layer) => (
          <div
            key={layer.key}
            className="rounded-2xl border bg-black/[0.02] p-3 dark:bg-white/[0.03]"
          >
            <dt className="flex items-center gap-2 font-semibold">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: layer.color }}
              />
              {t(layer.key)}
            </dt>
            <dd className="mt-1 text-xs text-foreground/70 dark:text-bg/70">
              {t(`${layer.key}Body` as const)}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
