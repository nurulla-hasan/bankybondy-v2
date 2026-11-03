"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  /**
   * Callback fired when the bottom sentinel enters view
   */
  onLoadMore: () => void | Promise<void>;
  /**
   * Whether more items are available to fetch
   */
  hasMore: boolean;
  /**
   * Whether an active fetch is currently in progress
   */
  isLoading: boolean;
  /**
   * Distance in pixels before reaching bottom to trigger fetch (e.g., "150px")
   * @default "150px"
   */
  rootMargin?: string;
  /**
   * Intersection threshold (0.0 to 1.0)
   * @default 0.01
   */
  threshold?: number;
  /**
   * Optional custom scrollable parent container ref. If omitted, uses viewport.
   */
  rootRef?: React.RefObject<HTMLElement | null>;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "150px",
  threshold = 0.01,
  rootRef,
}: UseInfiniteScrollOptions) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);

  // Keep refs in sync so the observer callback always has the latest state
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;
  }, [onLoadMore, hasMore, isLoading]);

  const sentinelRef = useCallback((element: HTMLElement | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          onLoadMoreRef.current();
        }
      },
      {
        root: rootRef?.current || null,
        rootMargin,
        threshold,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, hasMore, rootMargin, threshold, rootRef]);

  return { sentinelRef };
}
