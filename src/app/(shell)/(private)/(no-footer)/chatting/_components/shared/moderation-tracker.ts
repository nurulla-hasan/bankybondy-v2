"use client";

import { useSyncExternalStore } from "react";

import type { AudioModerationStatus } from "@/types";

export interface PendingAudio {
  id: string;
  trackedAt: number;
  /**
   * The "will be retried" notice was already shown. Persisted so a reload or a
   * route change doesn't replay it while the entry is still waiting.
   */
  retryNotified?: boolean;
  /** Last moderation status seen by the watcher; drives the feed banner copy. */
  status?: AudioModerationStatus;
}

const STORAGE_KEY = "bankybondy:chatting:pending-audio";

/** The worker stops retrying after ~2.5h; anything older is dead weight. */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

const EMPTY: PendingAudio[] = [];
const listeners = new Set<() => void>();

let cache: PendingAudio[] = EMPTY;
let hydrated = false;

function parse(raw: string | null): PendingAudio[] {
  if (!raw) return EMPTY;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const now = Date.now();
    const entries = parsed.flatMap((item): PendingAudio[] => {
      if (typeof item === "string") return [{ id: item, trackedAt: now }];

      if (item && typeof item === "object") {
        const { id, trackedAt, retryNotified, status } = item as Record<
          string,
          unknown
        >;
        if (typeof id === "string" && typeof trackedAt === "number") {
          return [
            {
              id,
              trackedAt,
              retryNotified: retryNotified === true,
              status:
                typeof status === "string"
                  ? (status as AudioModerationStatus)
                  : undefined,
            },
          ];
        }
      }

      return [];
    });

    return entries.filter((entry) => now - entry.trackedAt < MAX_AGE_MS);
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function load(): PendingAudio[] {
  if (typeof window === "undefined") return EMPTY;

  if (!hydrated) {
    hydrated = true;
    cache = parse(window.localStorage.getItem(STORAGE_KEY));
  }

  return cache;
}

function write(entries: PendingAudio[]) {
  cache = entries.length ? entries : EMPTY;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode / quota: tracking still works for this session.
  }

  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Keep tabs in sync and let a second tab stop polling what the first resolved.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    hydrated = true;
    cache = parse(event.newValue);
    emit();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): PendingAudio[] {
  return load();
}

function getServerSnapshot(): PendingAudio[] {
  return EMPTY;
}

/**
 * Remembers uploads whose moderation outlives the page (or the tab). The
 * dialog no longer polls on its own; this survives navigation and refresh.
 */
export function usePendingAudio() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function trackPendingAudio(id: string) {
  const current = load();
  if (current.some((entry) => entry.id === id)) return;
  write([...current, { id, trackedAt: Date.now() }]);
}

export function untrackPendingAudio(id: string) {
  const current = load();
  if (!current.some((entry) => entry.id === id)) return;
  write(current.filter((entry) => entry.id !== id));
}

/** Marks the technical-failure notice as delivered for this upload. */
export function markPendingAudioRetryNotified(id: string) {
  const current = load();
  if (!current.some((entry) => entry.id === id && !entry.retryNotified)) return;
  write(
    current.map((entry) =>
      entry.id === id ? { ...entry, retryNotified: true } : entry,
    ),
  );
}

/** Records the last status the watcher observed so the banner can reflect it. */
export function setPendingAudioStatus(
  id: string,
  status: AudioModerationStatus,
) {
  const current = load();
  const entry = current.find((item) => item.id === id);
  if (!entry || entry.status === status) return;
  write(current.map((item) => (item.id === id ? { ...item, status } : item)));
}
