import React from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number;
}

// V1 mark geometry (capsule · dot · bar · dot), painted with the v2 palette:
// cyan glow · primary indigo · emerald accent on a deep indigo capsule.
export function BrandMark({ className, size = 30, ...props }: BrandMarkProps) {
  const isLg = size >= 34;
  const isSm = size < 28;

  return (
    <div
      role="img"
      aria-label="Bankybondy"
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-[50%] border-2 border-brand-capsule-border/60 bg-brand-capsule",
        isLg && "h-9 w-32 gap-3 p-2",
        !isLg && !isSm && "h-8 w-28 gap-2.5 p-2",
        isSm && "h-7 w-22 gap-2 p-1.5",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "rounded-full bg-cyan-glow",
          isSm ? "size-1.5" : "size-2",
        )}
      />
      <span
        className={cn(
          "rounded-full bg-primary",
          isLg && "h-2 w-12",
          !isLg && !isSm && "h-2 w-10",
          isSm && "h-1.5 w-7",
        )}
      />
      <span
        className={cn(
          "rounded-full bg-emerald-accent",
          isSm ? "size-1.5" : "size-2",
        )}
      />
    </div>
  );
}

export default BrandMark;
