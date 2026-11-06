import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 6;

export function ConversationListSkeleton() {
  return (
    <div className="space-y-1" aria-hidden>
      {Array.from({ length: ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
