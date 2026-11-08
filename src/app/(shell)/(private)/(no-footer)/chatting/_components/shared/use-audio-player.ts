"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { errorToast } from "@/lib/toast";
import { useRecordAudioListen } from "@/services/hooks/audio.hook";

import type { FeedAudio } from "./audio-model";

export function useAudioPlayer() {
  const t = useTranslations("Chatting");
  const tRef = useRef(t);
  const [playing, setPlaying] = useState<FeedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const recordedRef = useRef<Set<string>>(new Set());
  const recordListen = useRecordAudioListen();
  const recordListenRef = useRef(recordListen);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    recordListenRef.current = recordListen;
  }, [recordListen]);

  useEffect(() => {
    if (!playing) {
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }

    const audio = new Audio(playing.audioUrl);
    audio.muted = mutedRef.current;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setElapsed(audio.currentTime);
      const threshold = Math.min(30, playing.durationSec * 0.4);

      if (audio.currentTime < threshold || recordedRef.current.has(playing.id)) {
        return;
      }

      recordedRef.current.add(playing.id);
      recordListenRef.current.mutate({
        audioId: playing.id,
        secondsListened: Math.round(audio.currentTime),
        completion: playing.durationSec
          ? Math.min(1, audio.currentTime / playing.durationSec)
          : 0,
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setElapsed(audio.duration || playing.durationSec);
    };

    const handleError = () => {
      setIsPlaying(false);
      errorToast(
        tRef.current("playFailed"),
        tRef.current("playFailedDescription"),
      );
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    void audio.play().then(
      () => setIsPlaying(true),
      () => handleError(),
    );

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.src = "";
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [playing]);

  const togglePlayback = (conversation: FeedAudio) => {
    if (playing?.id === conversation.id && audioRef.current) {
      const audio = audioRef.current;

      if (audio.ended) {
        audio.currentTime = 0;
        setElapsed(0);
      }

      if (audio.paused) {
        setIsPlaying(true);
        void audio.play().catch(() => setIsPlaying(false));
        return;
      }

      audio.pause();
      setIsPlaying(false);
      return;
    }

    setElapsed(0);
    setPlaying(conversation);
    setIsPlaying(true);
  };

  const seekBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio || !playing) return;

    const duration = Number.isFinite(audio.duration)
      ? audio.duration
      : playing.durationSec;
    const next = Math.min(Math.max(0, audio.currentTime + delta), duration);
    audio.currentTime = next;
    setElapsed(next);
  };

  const closePlayer = () => {
    setPlaying(null);
    setIsPlaying(false);
    setElapsed(0);
  };

  return {
    closePlayer,
    elapsed,
    isPlaying,
    muted,
    playing,
    seekBy,
    setMuted,
    togglePlayback,
  };
}
