"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { errorToast } from "@/lib/toast";
import { useRecordAudioListen } from "@/services/hooks/audio.hook";

import type { FeedAudio } from "./audio-model";
import { useAudioVolume } from "./use-audio-volume";

export function useAudioPlayer() {
  const t = useTranslations("Chatting");
  const tRef = useRef(t);
  const [playing, setPlaying] = useState<FeedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Keyed by track id so a previous track's real duration never leaks into the
  // next one without needing a reset (setState is banned in the effect body).
  const [loadedDuration, setLoadedDuration] = useState<{
    id: string;
    seconds: number;
  } | null>(null);
  const [buffering, setBuffering] = useState(false);
  const { muted, setVolume, toggleMute, volume } = useAudioVolume();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  const recordedRef = useRef<Set<string>>(new Set());
  const recordListen = useRecordAudioListen();
  const recordListenRef = useRef(recordListen);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Volume changes apply to the live element; refs let a newly created element
  // (one per track) start with the current level instead of resetting to 100%.
  useEffect(() => {
    volumeRef.current = volume;
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [muted, volume]);

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
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    const handleMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setLoadedDuration({ id: playing.id, seconds: audio.duration });
      }
    };

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
      setBuffering(false);
      setElapsed(audio.duration || playing.durationSec);
    };

    const handleError = () => {
      setIsPlaying(false);
      setBuffering(false);
      errorToast(
        tRef.current("playFailed"),
        tRef.current("playFailedDescription"),
      );
    };

    const handleBuffering = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);

    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("durationchange", handleMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("waiting", handleBuffering);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    void audio.play().then(
      () => {
        setIsPlaying(true);
        setBuffering(false);
      },
      () => handleError(),
    );

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("durationchange", handleMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("waiting", handleBuffering);
      audio.removeEventListener("playing", handlePlaying);
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
        setBuffering(true);
        void audio.play().catch(() => {
          setIsPlaying(false);
          setBuffering(false);
        });
        return;
      }

      audio.pause();
      setIsPlaying(false);
      setBuffering(false);
      return;
    }

    setElapsed(0);
    setLoadedDuration(null);
    setPlaying(conversation);
    setIsPlaying(true);
    setBuffering(true);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !playing) return;

    const total =
      loadedDuration?.id === playing.id
        ? loadedDuration.seconds
        : Number.isFinite(audio.duration)
          ? audio.duration
          : playing.durationSec;
    const next = Math.min(Math.max(0, seconds), total || 0);
    audio.currentTime = next;
    setElapsed(next);
  };

  const seekBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    seekTo(audio.currentTime + delta);
  };

  const closePlayer = () => {
    setPlaying(null);
    setIsPlaying(false);
    setBuffering(false);
    setElapsed(0);
    setLoadedDuration(null);
  };

  const totalDuration =
    loadedDuration && loadedDuration.id === playing?.id
      ? loadedDuration.seconds
      : (playing?.durationSec ?? 0);

  return {
    buffering,
    closePlayer,
    durationSec: totalDuration,
    elapsed,
    isPlaying,
    muted,
    playing,
    seekBy,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayback,
    volume,
  };
}
