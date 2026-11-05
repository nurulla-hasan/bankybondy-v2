"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeroCardSkeleton() {
  return (
    <section
      aria-hidden
      className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10"
    >
      <Skeleton className="h-36 w-full rounded-none sm:h-44" />

      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-16 shrink-0 sm:-mt-20">
              <Skeleton className="size-20 rounded-full ring-4 ring-card sm:size-24" />
            </div>

            <div className="min-w-0 space-y-2 pb-1">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-border/70 pt-5 sm:gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}
