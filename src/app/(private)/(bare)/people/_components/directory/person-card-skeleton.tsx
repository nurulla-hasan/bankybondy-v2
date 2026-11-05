"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PersonCardSkeleton() {
  return (
    <Card className="relative gap-0 rounded-2xl py-0 shadow-lg shadow-black/20 ring-border">
      <Skeleton className="h-28 w-full rounded-none" />

      <div className="relative -mt-10 flex items-end gap-3 px-4">
        <Skeleton className="size-20 shrink-0 rounded-full ring-2 ring-card" />

        <div className="min-w-0 flex-1 space-y-2 pb-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>

      <div className="flex gap-1.5 px-4 pt-3 pb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
    </Card>
  );
}
