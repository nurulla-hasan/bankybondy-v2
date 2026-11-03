import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
  showText = true,
  showTextOnMobile = false,
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTextOnMobile?: boolean;
  href?: string;
}) {
  const iconSize = size === "lg" ? "size-6" : size === "md" ? "size-5" : "size-4";
  const boxSize = size === "lg" ? "size-10" : size === "md" ? "size-9" : "size-7";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-90",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20",
          boxSize
        )}
      >
        <GraduationCap className={iconSize} />
      </div>

      {showText && (
        <div
          className={cn(
            showTextOnMobile ? "flex flex-col" : "hidden sm:flex flex-col",
            "leading-none"
          )}
        >
          <span
            className={cn(
              "font-bold tracking-tight text-foreground",
              size === "lg" && "text-lg",
              size === "md" && "text-base",
              size === "sm" && "text-sm"
            )}
          >
            UniPortal
          </span>
          <span className="text-[10px] text-muted-foreground font-normal tracking-wider uppercase">
            Academic System
          </span>
        </div>
      )}
    </Link>
  );
}
