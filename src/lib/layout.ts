export const CONTAINER_MAX_WIDTH = "max-w-350";
export const CONTAINER_GUTTER = "px-4 md:px-6";

// 4rem matches the navbar's h-16 so short pages still fill the area below it
export const PAGE_MIN_HEIGHT = "min-h-[calc(100dvh-4rem)]";

// Pages with internally-scrolling panes (messages) need a fixed height rather
// than a minimum, so the panes — and not the document — are the scrollers.
export const STICKY_HEIGHT = "h-[calc(100dvh-4rem)]";
