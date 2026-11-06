/**
 * Two-pane chat template. The pane owns the border and hides overflow; only its
 * body scrolls, so the document never does. Same recipe as
 * `components/common/modal.tsx:57,71`.
 */
export const PANE =
  "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card";

export const PANE_BODY = "min-h-0 flex-1 overflow-y-auto overscroll-contain";
