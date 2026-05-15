// Edge route handler returning the merged GitHub profile and recent repos payload
// Caches for 60 seconds via ISR style revalidation to stay inside rate limits
import { NextResponse } from 'next/server';
import { fetchProfile, fetchRecentRepos } from '@/lib/github';

export const runtime = 'edge';
export const revalidate = 60;

export async function GET() {
  const username = process.env.GITHUB_USERNAME ?? 'kranklee';
  try {
    const [profile, repos] = await Promise.all([
      fetchProfile(username),
      fetchRecentRepos(username, 3)
    ]);
    return NextResponse.json(
      { profile, repos },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
