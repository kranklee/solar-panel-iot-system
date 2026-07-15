// Lightweight skeleton placeholder used for loading states across cards
// Pure Tailwind animation, no external dependency
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-black/10 dark:bg-white/10',
        className
      )}
    />
  );
}
