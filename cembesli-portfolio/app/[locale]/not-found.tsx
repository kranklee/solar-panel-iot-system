// Locale aware 404 page rendered when no route segment matches
// Keeps users on the site with a clear link back to the home bento grid
import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-card border bg-card p-10 dark:bg-card-dark">
      <p className="text-xs font-medium uppercase tracking-widest text-primary">404</p>
      <h2 className="text-3xl font-semibold">This page wandered off.</h2>
      <p className="text-sm text-foreground/70 dark:text-bg/70">
        The link is broken or the page moved. Head back to the bento and keep exploring.
      </p>
      <Link href="/" className="btn-primary">
        Take me home
      </Link>
    </div>
  );
}
