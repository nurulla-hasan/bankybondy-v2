import { cn } from "@/lib/utils";

export interface ProgressGridItem {
  label: string;
  value: number;
  tone?: "primary" | "emerald" | "cyan";
}

interface ProgressGridProps {
  items: readonly ProgressGridItem[];
  className?: string;
}

const toneClasses = {
  primary: "bg-primary",
  emerald: "bg-emerald-accent",
  cyan: "bg-cyan-glow",
} as const;

export function ProgressGrid({ items, className }: ProgressGridProps) {
  return (
    <div className={cn("grid gap-8 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {item.value}%
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                toneClasses[item.tone ?? "primary"]
              )}
              style={{ width: `${item.value}%` }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
