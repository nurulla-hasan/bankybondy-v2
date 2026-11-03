"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to check if component has mounted on client (prevents hydration mismatch using useSyncExternalStore)
 */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Hook to copy text to clipboard with auto-reset status
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setIsCopied(false);
      return false;
    }
  };

  return { isCopied, copyToClipboard };
}

/**
 * Hook to debounce any value (e.g. search query, numeric inputs)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for a persistent countdown timer (persists in localStorage)
 */
export function useCountdown(
  initialSeconds: number,
  storageKey: string = "otp-timer",
  autoStart: boolean = true,
) {
  const isMounted = useHasMounted();
  const [targetTime, setTargetTime] = useLocalStorage<number | null>(
    storageKey,
    () => (autoStart ? Date.now() + initialSeconds * 1000 : null),
  );
  const [now, setNow] = useState(() => Date.now());

  const remaining = targetTime
    ? Math.max(0, Math.ceil((targetTime - now) / 1000))
    : 0;

  const isRunning = isMounted && targetTime !== null && remaining > 0;

  useEffect(() => {
    if (!isRunning) return;

    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning]);

  const start = useCallback(() => {
    const nextTarget = Date.now() + initialSeconds * 1000;
    setNow(Date.now());
    setTargetTime(nextTarget);
  }, [initialSeconds, setTargetTime]);

  const reset = useCallback(() => {
    setTargetTime(null);
  }, [setTargetTime]);

  const displaySeconds = isRunning ? remaining : initialSeconds;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    secondsLeft: formattedTime,
    rawSeconds: displaySeconds,
    isRunning,
    isMounted,
    start,
    reset,
  };
}

/**
 * Hook for interacting with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
      const initial =
        initialValue instanceof Function ? initialValue() : initialValue;
      if (initial !== null && initial !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(initial));
      }
      return initial;
    } catch (error) {
      console.error(error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Hook for media queries
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/**
 * Hook for network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for handling clicks outside of a referenced element
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/**
 * Hook for tracking window dimensions (useful for canvas scaling & responsive charts)
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for simple boolean toggle state
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse, setValue] as const;
}
