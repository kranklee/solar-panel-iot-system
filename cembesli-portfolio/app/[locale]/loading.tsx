// Streaming UI fallback shown while the locale segment resolves data
// Mirrors the bento layout with skeleton blocks so the swap feels seamless
import { Skeleton } from '@/components/ui/Skeleton';

export default function LocaleLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">
        <Skeleton className="col-span-1 row-span-2 h-full rounded-card sm:col-span-6 lg:col-span-7" />
        <Skeleton className="col-span-1 row-span-2 h-full rounded-card sm:col-span-6 lg:col-span-5" />
        <Skeleton className="col-span-1 row-span-4 h-full rounded-card sm:col-span-6 lg:col-span-8" />
        <Skeleton className="col-span-1 row-span-2 h-full rounded-card sm:col-span-6 lg:col-span-4" />
        <Skeleton className="col-span-1 row-span-2 h-full rounded-card sm:col-span-6 lg:col-span-4" />
      </div>
    </div>
  );
}
