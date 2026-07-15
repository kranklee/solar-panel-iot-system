# cembesli portfolio

Production grade interactive portfolio for Cem Besli. A live engineering showcase built with Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, next-intl, Pyodide, and Supabase.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS with next-themes |
| i18n | next-intl with EN, FR, DE |
| WASM | Pyodide running in a Web Worker |
| Database | Supabase PostgreSQL with Realtime |
| Hosting | Vercel Edge Runtime |
| CI | GitHub Actions |

## Features

- Apple style asymmetric bento grid layout
- Floating glass pill navbar with theme and locale switchers
- Live GitHub card backed by `/api/github` with 60 second ISR
- Python in the browser via Pyodide inside a Web Worker
- Three playable games: Starblast, Age of War, Drone Simulator
- Global leaderboard powered by Supabase Realtime
- Architecture case study with inline SVG diagram
- CV modal with embedded PDF viewer and download
- Server rendered metadata, security headers, AVIF and WebP images

## Local development

```bash
cd cembesli-portfolio
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and you will be redirected to `/en`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint with the Next.js config |
| `npm run type-check` | Run `tsc --noEmit` |

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values.

| Name | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Server side token used by the GitHub API route |
| `GITHUB_USERNAME` | GitHub login displayed on the GitHub card |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for browser reads and writes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key reserved for server side operations |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in metadata |

## Supabase schema

```sql
create table scores (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  game text not null check (game in ('starblast', 'ageofwar', 'dronesim')),
  score integer not null,
  created_at timestamp with time zone default now()
);

create index scores_game_score_idx on scores(game, score desc);

alter table scores enable row level security;

create policy "Anyone can read scores" on scores
  for select using (true);

create policy "Anyone can insert scores" on scores
  for insert with check (true);
```

Once the table is created, enable Realtime for the `scores` table from the Supabase dashboard so the leaderboard updates live.

## Assets

Place your CV at `cembesli-portfolio/public/cv.pdf`. The CV modal serves the file through an iframe and exposes a download link to the same path.

## Deployment

The app targets Vercel Edge Runtime. Import the repository in Vercel, set the environment variables above in the project settings, and ship. The included GitHub Actions workflow runs lint, type check, and build on every push and pull request to `main`.

## Project structure

```
cembesli-portfolio/
  app/
    [locale]/
      layout.tsx
      page.tsx
    api/
      github/route.ts
      contact/route.ts
    layout.tsx
    page.tsx
  components/
    bento/
    games/
    layout/
    providers/
    ui/
  lib/
  messages/
  styles/
  i18n.ts
  middleware.ts
  next.config.js
  tailwind.config.ts
```

## License

MIT
