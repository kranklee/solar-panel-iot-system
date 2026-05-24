// Self documenting JSON endpoint summarizing the portfolio owner
// Designed to be curl friendly and useful as a public read only API
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cembesli.com';
  const payload = {
    name: 'Cem Besli',
    role: 'Software Engineer',
    location: 'Ottawa, Ontario, Canada',
    availability: 'Open to roles in Ottawa, Ontario, and remote globally',
    languages: ['English', 'French', 'German', 'Turkish'],
    education: {
      school: 'Centennial College',
      program: 'Software Engineering Technology',
      semester: 6
    },
    links: {
      site: siteUrl,
      github: 'https://github.com/kranklee',
      linkedin: 'https://www.linkedin.com/in/cembesli',
      email: 'cem@cembesli.com'
    },
    stack: {
      languages: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'C#'],
      frameworks: ['Next.js', 'React', 'Node.js', 'Tailwind', 'FastAPI'],
      cloud: ['Vercel', 'Supabase', 'AWS', 'Cloudflare']
    },
    api: {
      cv: `${siteUrl}/api/cv`,
      github: `${siteUrl}/api/github`,
      chat: `${siteUrl}/api/chat`
    },
    updated: new Date().toISOString()
  };
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
