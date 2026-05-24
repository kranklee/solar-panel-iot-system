// Static catalog of case studies driving the /projects index and detail pages
// Each entry contains structured sections so the case study template stays uniform
export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  year: string;
  tech: string[];
  href: string;
  problem: string;
  design: string[];
  lessons: string[];
  accent: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'solar-iot',
    title: 'Solar Panel IoT Monitoring System',
    summary:
      'MQTT publisher and subscriber simulating weather aware solar panel output with a tkinter dashboard.',
    year: '2025',
    tech: ['Python', 'paho-mqtt', 'tkinter', 'JSON'],
    href: 'https://github.com/kranklee/solar-panel-iot-system',
    problem:
      'Build a teaching grade IoT system that publishes realistic rooftop solar panel power readings and lets a subscriber visualize them. The data should respect weather effects and a day arc, not just noise.',
    design: [
      'Sensor simulator owns a state machine of weather conditions with weighted transitions.',
      'Day arc is modeled as a half period sine wave over a configurable number of steps.',
      'Publisher uses paho-mqtt to push JSON encoded readings on a topic.',
      'Subscriber renders the live feed in a tkinter UI that supports dark and light themes.'
    ],
    lessons: [
      'Realistic simulation beats random noise. The weather state machine made charts believable.',
      'Tkinter is a fine teaching surface but the same data shape ports cleanly to a web dashboard.',
      'Type the schema once. Sharing JSON schema between publisher and subscriber removed a class of bugs.'
    ],
    accent: '#fbbf24'
  },
  {
    slug: 'portfolio',
    title: 'cembesli.com Interactive Portfolio',
    summary:
      'This site. A Next.js 14 bento grid with Pyodide, Supabase realtime games, an AI assistant, and four locales.',
    year: '2026',
    tech: ['Next.js 14', 'TypeScript', 'Supabase', 'Pyodide', 'Tailwind', 'next-intl'],
    href: 'https://github.com/kranklee/solar-panel-iot-system/tree/main/cembesli-portfolio',
    problem:
      'Build a portfolio that proves engineering chops live, not via screenshots. It should run real code in the browser, talk to a real database, and serve four languages with edge latency.',
    design: [
      'Apple style bento grid with twelve column CSS grid and 180 pixel auto rows.',
      'Pyodide loaded inside a Web Worker so Python execution never blocks the main thread.',
      'Three canvas games posting to a Supabase Postgres table that streams updates via Realtime.',
      'next-intl driving EN FR DE TR with localePrefix as needed and hreflang on every route.',
      'AI assistant streaming from Anthropic Claude Haiku 4.5 with a CV grounded system prompt.'
    ],
    lessons: [
      'Pin floating dependency ranges that touch your runtime layer. next-intl 3.20 to 3.27 broke the request scope.',
      'Edge route handlers love small payloads. The whoami endpoint is faster than the cache.',
      'Build accessibility in from minute one. Retrofitting skip links and aria labels is annoying.'
    ],
    accent: '#6366f1'
  }
];

export function findCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((entry) => entry.slug === slug);
}
