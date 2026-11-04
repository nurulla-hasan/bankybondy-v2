import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CONTAINER_GUTTER,
  CONTAINER_MAX_WIDTH,
  PAGE_MIN_HEIGHT,
} from "@/lib/layout";

type PagePadding = "default" | "compact" | "spacious" | "none";

interface PageWrapperProps {
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
  padding?: PagePadding;
}

/**
 * Vertical padding presets. Horizontal gutters are always applied so pages
 * stay aligned with the navbar and footer.
 */
const paddingMap: Record<PagePadding, string> = {
  default: "pt-8 pb-12 lg:pb-18",
  compact: "pt-5 pb-8 lg:pb-12",
  spacious: "pt-12 pb-16 lg:pb-24",
  none: "",
};

function PageWrapper({
  children,
  pagination,
  className,
  padding = "default",
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col",
        CONTAINER_MAX_WIDTH,
        CONTAINER_GUTTER,
        PAGE_MIN_HEIGHT,
        paddingMap[padding],
      )}
    >
      <div className={cn("grow", className)}>{children}</div>
      {pagination}
    </div>
  );
}

export { PageWrapper };
export type { PagePadding };
