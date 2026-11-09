"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Headphones,
  Loader2,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Share2,
  ShieldAlert,
  SkipBack,
  SkipForward,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { RelativeTime } from "@/components/common/relative-time";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorToast, successToast } from "@/lib/toast";
import { cn, getInitials } from "@/lib/utils";
import {
  useAudioDetail,
  useBookmarkedAudioIds,
  useRecordAudioListen,
  useToggleAudioBookmark,
} from "@/services/hooks/audio.hook";
import { useMyProfileId } from "@/services/hooks/profile.hook";

import { AudioSlider } from "../shared/audio-slider";
import { compactNumber, formatClock } from "../shared/format";
import { useAudioVolume } from "../shared/use-audio-volume";
import { VolumeControl } from "../shared/volume-control";
import { Waveform } from "../shared/waveform";
import { CommentsSection } from "./comments-section";
import { FeedbackPanel } from "./feedback-panel";

interface ConversationDetailProps {
  audioId: string;
}

const MIN_PLAYED_SECONDS = 30;
const QUALIFIED_COMPLETION = 0.4;

export function ConversationDetail({ audioId }: ConversationDetailProps) {
  const t = useTranslations("Chatting");
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const detailQuery = useAudioDetail(audioId);
  const profileId = useMyProfileId();
  const savedQuery = useBookmarkedAudioIds();
  const toggleSave = useToggleAudioBookmark();
  const recordListen = useRecordAudioListen();

  const audio = detailQuery.data;
  const isOwner = Boolean(profileId && audio?.user?._id === profileId);
  const isReady = audio?.moderationStatus === "ready";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Keyed by URL so a stale metadata read never wins after the audio changes.
  const [loadedDuration, setLoadedDuration] = useState<{
    url: string;
    seconds: number;
  } | null>(null);
  const { muted, setVolume, toggleMute, volume } = useAudioVolume();
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);

  useEffect(() => {
    if (!audio?.audio_url) return;

    const element = new Audio(audio.audio_url);
    element.preload = "metadata";
    element.volume = volumeRef.current;
    element.muted = mutedRef.current;
    audioRef.current = element;
    recordedRef.current = false;

    const handleMetadata = () => {
      if (Number.isFinite(element.duration) && element.duration > 0) {
        setLoadedDuration({ url: audio.audio_url, seconds: element.duration });
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setElapsed(element.currentTime);

      const duration = audio.duration || element.duration || 0;
      const threshold = Math.min(
        MIN_PLAYED_SECONDS,
        duration * QUALIFIED_COMPLETION,
      );
      if (
        recordedRef.current ||
        !threshold ||
        element.currentTime < threshold
      ) {
        return;
      }

      recordedRef.current = true;
      recordListen.mutate({
        audioId: audio._id,
        secondsListened: Math.round(element.currentTime),
        completion: duration ? Math.min(1, element.currentTime / duration) : 0,
      });
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setElapsed(audio.duration || element.duration || 0);
    };
    const handleError = () => {
      setIsPlaying(false);
      errorToast(
        tRef.current("playFailed"),
        tRef.current("playFailedDescription"),
      );
    };

    element.addEventListener("loadedmetadata", handleMetadata);
    element.addEventListener("durationchange", handleMetadata);
    element.addEventListener("play", handlePlay);
    element.addEventListener("pause", handlePause);
    element.addEventListener("timeupdate", handleTimeUpdate);
    element.addEventListener("ended", handleEnded);
    element.addEventListener("error", handleError);

    return () => {
      element.pause();
      element.removeEventListener("loadedmetadata", handleMetadata);
      element.removeEventListener("durationchange", handleMetadata);
      element.removeEventListener("play", handlePlay);
      element.removeEventListener("pause", handlePause);
      element.removeEventListener("timeupdate", handleTimeUpdate);
      element.removeEventListener("ended", handleEnded);
      element.removeEventListener("error", handleError);
      element.src = "";
      if (audioRef.current === element) audioRef.current = null;
    };
    // The player is rebuilt only when the signed URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio?.audio_url, audio?._id]);

  useEffect(() => {
    volumeRef.current = volume;
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [muted, volume]);

  const togglePlayback = () => {
    const element = audioRef.current;
    if (!element) return;

    if (element.paused) {
      if (element.ended) {
        element.currentTime = 0;
        setElapsed(0);
      }
      void element.play().catch(() => setIsPlaying(false));
      return;
    }

    element.pause();
  };

  const seekTo = (seconds: number) => {
    const element = audioRef.current;
    if (!element) return;

    const total =
      loadedDuration && loadedDuration.url === audio?.audio_url
        ? loadedDuration.seconds
        : Number.isFinite(element.duration)
          ? element.duration
          : (audio?.duration ?? 0);
    const next = Math.min(Math.max(0, seconds), total);
    element.currentTime = next;
    setElapsed(next);
  };

  const seekBy = (delta: number) => {
    const element = audioRef.current;
    if (!element) return;

    seekTo(element.currentTime + delta);
  };

  const handleShare = async () => {
    if (!audio) return;

    try {
      const url = `${window.location.origin}/chatting/conversations/${audio._id}`;

      if (navigator.share) {
        await navigator.share({ title: audio.title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      successToast(t("shareCopied"));
    } catch {
      // The share sheet was dismissed; there is nothing to report.
    }
  };

  if (detailQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-72 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-2xl lg:col-span-7" />
          <Skeleton className="h-96 rounded-2xl lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !audio) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-12 md:px-6">
        <EmptyState
          icon={<Headphones className="size-5" aria-hidden />}
          title={t("detailErrorTitle")}
          description={t("detailErrorDescription")}
          action={
            <Button variant="outline" render={<Link href="/chatting" />}>
              <ArrowLeft aria-hidden />
              {t("detailErrorAction")}
            </Button>
          }
        />
      </div>
    );
  }

  const totalDuration =
    loadedDuration && loadedDuration.url === audio.audio_url
      ? loadedDuration.seconds
      : audio.duration || 0;
  const progress = totalDuration
    ? Math.min(100, (elapsed / totalDuration) * 100)
    : 0;
  const isSaved = savedQuery.data?.has(audio._id) ?? false;

  return (
    <div className="space-y-6">
      <Button variant="ghost" render={<Link href="/chatting" />}>
        <ArrowLeft aria-hidden />
        {t("detailBack")}
      </Button>

      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative aspect-video max-h-72 w-full overflow-hidden bg-linear-to-br from-primary/25 via-tone-violet/15 to-transparent sm:aspect-auto sm:h-64">
          {audio.cover_image ? (
            <Image
              src={audio.cover_image}
              alt=""
              fill
              unoptimized
              priority
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-4 sm:p-6">
            {audio.audioTopic ? (
              <Badge variant="secondary">{audio.audioTopic.name}</Badge>
            ) : null}
            <Badge variant="secondary">
              {formatClock(audio.duration)}
            </Badge>
            <Badge variant="secondary">
              <Headphones className="size-3" aria-hidden />
              {compactNumber(audio.totalPlay)}
            </Badge>
            {audio.ratingCount ? (
              <Badge variant="secondary">
                <Star className="size-3" aria-hidden />
                {audio.averageRating.toFixed(1)}
              </Badge>
            ) : null}
            <Badge variant="secondary">
              <MessageCircle className="size-3" aria-hidden />
              {compactNumber(audio.commentCount)}
            </Badge>
            {isOwner ? (
              <Badge variant="outline">{t("detailOwner")}</Badge>
            ) : null}
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {audio.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage
                      src={audio.user?.profile_image}
                      alt={audio.user?.name ?? ""}
                    />
                    <AvatarFallback>
                      {getInitials(audio.user?.name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  {audio.user?.name ?? t("detailUnknownAuthor")}
                </span>
                {audio.createdAt ? (
                  <RelativeTime date={audio.createdAt} />
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={isSaved ? "secondary" : "outline"}
                aria-pressed={isSaved}
                aria-label={
                  isSaved
                    ? t("cardUnsave", { title: audio.title })
                    : t("cardSave", { title: audio.title })
                }
                onClick={() => toggleSave.mutate(audio._id)}
              >
                <Bookmark
                  aria-hidden
                  className={cn(isSaved && "fill-current")}
                />
                {isSaved ? t("featuredSaved") : t("featuredSave")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("cardShare", { title: audio.title })}
                onClick={() => void handleShare()}
              >
                <Share2 aria-hidden />
              </Button>
            </div>
          </div>

          {audio.description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {audio.description}
            </p>
          ) : null}

          {audio.tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {audio.tags.map((tag) => (
                <Badge key={tag} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          {!isReady ? (
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
              {audio.moderationStatus === "processing" ? (
                <Loader2
                  className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden
                />
              ) : audio.moderationStatus === "failed" ? (
                <RefreshCw
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : (
                <ShieldAlert
                  className="mt-0.5 size-5 shrink-0 text-destructive"
                  aria-hidden
                />
              )}
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">
                  {audio.moderationStatus === "processing"
                    ? t("detailStatusProcessing")
                    : audio.moderationStatus === "failed"
                      ? t("detailStatusFailed")
                      : t("detailStatusRejected")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {audio.moderationStatus === "rejected"
                    ? audio.moderationReason || t("detailStatusRejectedDescription")
                    : audio.moderationStatus === "failed"
                      ? t("detailStatusFailedDescription")
                      : t("detailStatusProcessingDescription")}
                </p>
                {isOwner && audio.moderationStatus === "ready" ? (
                  <Button
                    variant="outline"
                    render={<Link href="/chatting/my-content" />}
                  >
                    {t("detailManage")}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
              <Waveform bars={64} progress={progress} className="h-14" />

              <AudioSlider
                value={elapsed}
                max={totalDuration}
                onValueChange={seekTo}
                ariaLabel={t("playerSeek")}
                valueText={`${formatClock(elapsed)} / ${formatClock(totalDuration)}`}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="icon-lg"
                  aria-label={isPlaying ? t("playerPause") : t("playerPlay")}
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("playerBack")}
                  onClick={() => seekBy(-15)}
                >
                  <SkipBack aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("playerForward")}
                  onClick={() => seekBy(15)}
                >
                  <SkipForward aria-hidden />
                </Button>

                <VolumeControl
                  volume={volume}
                  muted={muted}
                  onToggleMute={toggleMute}
                  onVolumeChange={setVolume}
                  ariaLabel={t("playerVolume")}
                  muteLabel={t("playerMute")}
                  unmuteLabel={t("playerUnmute")}
                />

                <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                  {formatClock(elapsed)}
                  <span aria-hidden> / </span>
                  {formatClock(totalDuration)}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <CommentsSection
            key={audio._id}
            audioId={audio._id}
            enabled={isReady}
          />
        </div>
        <div className="lg:col-span-5">
          <FeedbackPanel
            key={audio._id}
            audio={audio}
            isOwner={isOwner}
            enabled={isReady}
          />
        </div>
      </div>

    </div>
  );
}
