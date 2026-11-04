import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type HeadingAlignment = "left" | "center";
type HeadingVariant = "default" | "plain";

interface SectionHeadingProps {
  badge?: string;
  /** Small uppercase label shown above the title, with a leading dot. */
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  alignment?: HeadingAlignment;
  className?: string;
  children?: ReactNode;
  /** Heading HTML tag: h1-h4 (default: h2) */
  as?: "h1" | "h2" | "h3" | "h4";
  /** `default` uses the brand primary uppercase style. `plain` uses normal-case foreground. */
  variant?: HeadingVariant;
  /** Override default title size classes */
  titleClassName?: string;
  /** Extra classes for the description (e.g. spacing or max-width). */
  descriptionClassName?: string;
  /** Whether to constrain width to max-w-2xl (default: true). Set false inside grid/flex layouts */
  constrain?: boolean;
}

const alignmentClasses: Record<HeadingAlignment, string> = {
  left: "text-left",
  center: "text-center",
};

const headingSizes: Record<string, string> = {
  h1: "text-3xl font-bold sm:text-4xl",
  h2: "text-2xl font-semibold sm:text-3xl",
  h3: "text-xl font-semibold sm:text-2xl",
  h4: "text-lg font-semibold",
};

export function SectionHeading({
  badge,
  eyebrow,
  title,
  description,
  alignment = "center",
  className,
  children,
  as: Tag = "h2",
  variant = "default",
  titleClassName,
  descriptionClassName,
  constrain = true,
}: SectionHeadingProps) {
  const hasKicker = Boolean(badge || eyebrow);

  return (
    <div
      className={cn(
        constrain && !children && "max-w-2xl",
        alignment === "center" && "mx-auto",
        alignmentClasses[alignment],
        !children && className
      )}
    >
      <div
        className={cn(
          children && "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
          children && className
        )}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {eyebrow}
            </p>
          )}

          {badge && <Badge variant="secondary">{badge}</Badge>}

          <Tag
            className={cn(
              hasKicker ? "mt-3" : "",
              "tracking-tight text-primary font-heading uppercase",
              variant === "plain" && "text-foreground normal-case",
              titleClassName ?? headingSizes[Tag]
            )}
          >
            {title}
          </Tag>

          {description && (
            <p
              className={cn(
                "text-sm leading-6 text-muted-foreground sm:text-base",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
