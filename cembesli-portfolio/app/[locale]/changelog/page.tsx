// Public changelog page driven by a static, dated list of shipped items
// Kept in a single data file so updates are one PR, one diff
import { setRequestLocale, getTranslations } from 'next-intl/server';

interface Release {
  date: string;
  title: string;
  items: string[];
}

const RELEASES: Release[] = [
  {
    date: '2026-05-24',
    title: 'Portfolio v1.1',
    items: [
      'Added AI assistant card streaming from Claude Haiku 4.5',
      'Added live solar panel dashboard and dedicated /dashboard route',
      'Added command palette with Cmd K shortcut',
      'Added Turkish locale, hreflang, and JSON-LD Person schema',
      'Added uses, now, changelog, and status pages',
      'Added achievements system with eight unlockables and Konami code',
      'Added mobile drawer navigation and on-screen joystick for games'
    ]
  },
  {
    date: '2026-05-15',
    title: 'Portfolio v1.0',
    items: [
      'Initial bento grid with GitHub, Python in browser, three games, leaderboard',
      'next-intl in EN, FR, DE with locale switcher',
      'Vercel Edge runtime, GitHub Actions CI for type-check, lint, build'
    ]
  },
  {
    date: '2025-12',
    title: 'Solar Panel IoT Monitoring System',
    items: [
      'Python publisher with simulated sensor and MQTT pub-sub',
      'Subscriber app with tkinter dashboard',
      'Weather-aware day-arc data generator'
    ]
  }
];

export default async function ChangelogPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('changelog');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">log</p>
        <h1 className="text-4xl font-semibold">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-foreground/70 dark:text-bg/70">{t('subtitle')}</p>
      </header>

      <ol className="relative space-y-6 border-l pl-6">
        {RELEASES.map((release) => (
          <li key={release.date} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[31px] top-1.5 inline-block h-3 w-3 rounded-full border-2 border-bg bg-primary dark:border-bg-dark"
            />
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/50 dark:text-bg/50">
              {release.date}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold">{release.title}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80 dark:text-bg/80">
              {release.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}
