import { cn } from "@/lib/utils";

export interface StatStripItem {
  value: string;
  label: string;
}

interface StatStripProps {
  items: readonly StatStripItem[];
  className?: string;
}

export function StatStrip({ items, className }: StatStripProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-4 sm:gap-6", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <p className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {item.value}
          </p>
          <p className="mt-1 text-xs leading-tight text-muted-foreground sm:text-sm">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
