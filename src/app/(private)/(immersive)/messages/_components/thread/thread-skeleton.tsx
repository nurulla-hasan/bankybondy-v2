"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROWS = ["w-40", "w-24", "w-56", "w-32", "w-64", "w-20"];

export function ThreadSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6" aria-hidden>
      {ROWS.map((width, index) => (
        <div key={width} className={cn("flex", index % 2 ? "justify-end" : "justify-start")}>
          <Skeleton className={cn("h-12 rounded-2xl", width)} />
        </div>
      ))}
    </div>
  );
}
