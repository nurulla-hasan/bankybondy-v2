"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  isChatSoundEnabled,
  setChatSoundEnabled,
  subscribeChatSound,
} from "@/lib/sound";

const getServerSnapshot = () => true;

/** Reads the shared sound preference and exposes a stable setter. */
export function useChatSound() {
  const enabled = useSyncExternalStore(
    subscribeChatSound,
    isChatSoundEnabled,
    getServerSnapshot,
  );

  const setEnabled = useCallback((value: boolean) => {
    setChatSoundEnabled(value);
  }, []);

  return { enabled, setEnabled };
}
