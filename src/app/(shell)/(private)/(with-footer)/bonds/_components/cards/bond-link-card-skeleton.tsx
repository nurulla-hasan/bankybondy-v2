"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BondLinkCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>

        <Skeleton className="h-5 w-20 shrink-0" />
      </div>

      <div className="flex -space-x-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={index}
            className="size-6 rounded-full ring-2 ring-background"
          />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
