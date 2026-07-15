// Shared MDX component map applying the bento typography and code styling
// Imported once per app and merged into every MDX render
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function mdxComponents(): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="mt-10 text-4xl font-semibold">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-8 text-2xl font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold">{children}</h3>,
    p: ({ children }) => <p className="mt-4 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="mt-4 list-disc space-y-1 pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1 pl-6">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    a: ({ href, children }) => (
      <Link href={href ?? '#'} className="text-primary underline-offset-4 hover:underline">
        {children}
      </Link>
    ),
    code: ({ children }) => (
      <code className="rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[0.95em] dark:bg-white/10">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="scrollbar-thin mt-4 overflow-x-auto rounded-2xl border bg-black p-4 text-xs leading-relaxed text-emerald-200">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-l-2 border-primary pl-4 italic text-foreground/70 dark:text-bg/70">
        {children}
      </blockquote>
    )
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents(), ...components };
}
