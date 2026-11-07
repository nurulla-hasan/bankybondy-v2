"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useChatSound } from "@/hooks/useChatSound";
import { playReceiveSound } from "@/lib/sound";

/**
 * Per-browser mute for chat sounds. The preference lives in `lib/sound.ts` so
 * the socket provider and the send mutation read the same value without prop
 * drilling.
 */
export function ChatSoundToggle() {
  const t = useTranslations("Messages");
  const { enabled, setEnabled } = useChatSound();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    // Enabling plays the incoming sound once, so the choice is audible.
    if (next) playReceiveSound();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={enabled}
      aria-label={enabled ? t("muteSounds") : t("unmuteSounds")}
      onClick={toggle}
    >
      {enabled ? <Volume2 /> : <VolumeX />}
    </Button>
  );
}
