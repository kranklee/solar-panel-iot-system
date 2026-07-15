// Filesystem driven MDX blog index that returns post metadata for index and detail rendering
// Posts live under content/blog and carry frontmatter with title, description, date, lang, and tags
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  lang: 'en' | 'de' | 'fr' | 'tr';
  tags: string[];
  readingMinutes: number;
}

export interface Post extends PostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function estimateReadingMinutes(body: string): number {
  const words = body.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

async function readEntry(file: string): Promise<Post> {
  const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as Partial<PostMeta>;
  const slug = file.replace(/\.mdx?$/, '');
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    date: data.date ?? '1970-01-01',
    lang: (data.lang as PostMeta['lang']) ?? 'en',
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingMinutes: estimateReadingMinutes(parsed.content),
    content: parsed.content
  };
}

export async function listPosts(): Promise<PostMeta[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(BLOG_DIR);
  } catch {
    return [];
  }
  const posts = await Promise.all(
    entries
      .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
      .map(readEntry)
  );
  return posts
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  for (const ext of ['mdx', 'md']) {
    try {
      return await readEntry(`${slug}.${ext}`);
    } catch {
      // try next extension
    }
  }
  return null;
}

export async function listSlugs(): Promise<string[]> {
  const posts = await listPosts();
  return posts.map((post) => post.slug);
}
