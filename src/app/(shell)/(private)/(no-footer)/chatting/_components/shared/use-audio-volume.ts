"use client";

import { useRef, useState } from "react";

export function useAudioVolume() {
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const lastVolumeRef = useRef(1);

  const setVolume = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    if (clamped > 0) {
      setMuted(false);
      lastVolumeRef.current = clamped;
    }
  };

  const toggleMute = () => {
    if (muted || volume === 0) {
      const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
      setMuted(false);
      setVolumeState(restored);
      return;
    }

    lastVolumeRef.current = volume;
    setMuted(true);
  };

  return {
    // A slider at 0 and a muted flag are the same thing to the user.
    muted: muted || volume === 0,
    setVolume,
    toggleMute,
    volume,
  };
}
