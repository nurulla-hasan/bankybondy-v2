"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MyContentCardSkeleton() {
  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row items-center">
      {/* Cover image thumbnail */}
      <Skeleton className="size-24 shrink-0 rounded-xl" />

      {/* Content details */}
      <div className="min-w-0 flex-1 space-y-2 w-full">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-3.5 w-12" />
        </div>

        <Skeleton className="h-5 w-3/4 max-w-md" />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-1 self-start sm:self-center">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="size-7 rounded-md" />
      </div>
    </article>
  );
}
