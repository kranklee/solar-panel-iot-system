// RSS 2.0 feed enumerating every blog post for discovery by feed readers
// Served at /feed.xml so blogrolls and aggregators can subscribe cleanly
import { NextResponse } from 'next/server';
import { listPosts } from '@/lib/blog';

export const revalidate = 3600;

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cembesli.com';
  const posts = await listPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${site}/en/blog/${post.slug}</link>
      <guid>${site}/en/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Cem Besli Blog</title>
    <link>${site}</link>
    <description>Notes on building interactive systems, life in Germany, and engineering tradeoffs.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
