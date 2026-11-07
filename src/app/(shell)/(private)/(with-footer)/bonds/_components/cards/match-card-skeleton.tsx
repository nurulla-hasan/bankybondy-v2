"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ParticipantNodeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-2xl border border-border bg-background/70 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />

        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>

        <Skeleton className="h-3.5 w-16" />
      </div>

      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        <ParticipantNodeSkeleton />

        <div className="flex items-center justify-center py-1 lg:py-0">
          <Skeleton className="size-6 shrink-0 rounded-full" />
        </div>

        <ParticipantNodeSkeleton />
      </div>

      <Skeleton className="mt-3 h-9 w-full rounded-xl" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
