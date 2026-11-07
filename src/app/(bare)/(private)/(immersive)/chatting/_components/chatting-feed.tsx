"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Headphones,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { StatStrip } from "@/components/common/stat-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorToast, successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  FEED_PAGE_SIZE,
  useAudioFeed,
  useAudioTopics,
  useBookmarkedAudioIds,
  useRecordAudioListen,
  useToggleAudioBookmark,
} from "@/services/hooks/audio.hook";
import type { AudioFeedSort, AudioListQueryParams } from "@/types";

import { ConversationCard } from "./cards/conversation-card";
import { FeaturedConversation } from "./cards/featured-conversation";
import { HowItWorksCard } from "./cards/how-it-works-card";
import { ShareConversationDialog } from "./dialogs/share-conversation-dialog";
import { MiniPlayer } from "./mini-player";
import { AudioModerationWatcher } from "./moderation-watcher";
import { SectionNav, sectionLabelKey, type FeedSection } from "./section-nav";
import {
  toFeedAudio,
  toFeedVoices,
  type FeedAudio,
} from "./shared/audio-model";
import { compactNumber } from "./shared/format";
import { usePendingAudio } from "./shared/moderation-tracker";
import { SideRail } from "./side-rail";
import { Waveform } from "./shared/waveform";

const SECTION_SORT: Record<FeedSection, AudioFeedSort> = {
  recent: "-createdAt",
  trending: "-trendingScore",
  mostPlayed: "-totalPlay",
};

export function ChattingFeed() {
  const t = useTranslations("Chatting");
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const [section, setSection] = useState<FeedSection>("recent");
  const [topicId, setTopicId] = useState<string | null>(null);
  const pendingAudio = usePendingAudio();

  const params = useMemo<AudioListQueryParams>(
    () => ({
      page: 1,
      limit: FEED_PAGE_SIZE,
      sort: SECTION_SORT[section],
      audioTopic: topicId ?? undefined,
    }),
    [section, topicId],
  );

  const feedQuery = useAudioFeed(params);
  const statsQuery = useAudioFeed({ page: 1, limit: 1 });
  const topicsQuery = useAudioTopics();
  const savedQuery = useBookmarkedAudioIds();
  const toggleSave = useToggleAudioBookmark();
  const recordListen = useRecordAudioListen();

  const items = useMemo(
    () =>
      (feedQuery.data?.result ?? [])
        .map((audio, index) => toFeedAudio(audio, index))
        .filter((audio): audio is FeedAudio => audio !== null),
    [feedQuery.data],
  );

  const topics = useMemo(
    () => topicsQuery.data ?? [],
    [topicsQuery.data],
  );
  const savedIds = savedQuery.data ?? new Set<string>();
  const voices = useMemo(() => toFeedVoices(items), [items]);

  const INITIAL_VISIBLE_TOPICS = 6;
  const [showAllTopics, setShowAllTopics] = useState(false);

  const visibleTopics = useMemo(() => {
    if (showAllTopics) return topics;
    const slice = topics.slice(0, INITIAL_VISIBLE_TOPICS);
    if (topicId && !slice.some((t) => t._id === topicId)) {
      const selected = topics.find((t) => t._id === topicId);
      if (selected) {
        return [...slice.slice(0, INITIAL_VISIBLE_TOPICS - 1), selected];
      }
    }
    return slice;
  }, [showAllTopics, topics, topicId]);

  const hiddenCount = topics.length - visibleTopics.length;

  const featured =
    section === "recent" && topicId === null ? items[0] : undefined;
  const visible = featured ? items.slice(1) : items;
  const totalCount = feedQuery.data?.meta.total ?? items.length;

  const [playing, setPlaying] = useState<FeedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const recordedRef = useRef<Set<string>>(new Set());
  const recordListenRef = useRef(recordListen);

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

      // A qualified listen is ≥30s or ≥40% (`audio.listen.ts`); send it once
      // per playback session and let the server dedupe per day.
      const threshold = Math.min(30, playing.durationSec * 0.4);
      if (
        audio.currentTime < threshold ||
        recordedRef.current.has(playing.id)
      ) {
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
      () => {
        setIsPlaying(false);
        errorToast(
          tRef.current("playFailed"),
          tRef.current("playFailedDescription"),
        );
      },
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

  const handlePlay = (conversation: FeedAudio) => {
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

  const handleSelectTopic = (nextTopicId: string) => {
    setTopicId((current) => (current === nextTopicId ? null : nextTopicId));
  };

  const handleShare = async (conversation: FeedAudio) => {
    try {
      const url = `${window.location.origin}/chatting?c=${conversation.id}`;

      if (navigator.share) {
        await navigator.share({ title: conversation.title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      successToast(t("shareCopied"));
    } catch {
      // The share sheet was dismissed; there is nothing to report.
    }
  };

  const handleExplore = () => {
    document
      .getElementById("chatting-topics")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const featuredIsPlaying =
    playing?.id === featured?.id &&
    isPlaying &&
    elapsed < (featured?.durationSec ?? 0);
  const featuredProgress =
    playing?.id === featured?.id && featured?.durationSec
      ? (elapsed / featured.durationSec) * 100
      : 0;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 px-4 pt-5 pb-8 md:px-6 lg:pb-12",
        playing && "pb-24",
      )}
    >
      <AudioModerationWatcher />

      <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-primary/10 via-tone-violet/10 to-transparent"
        />
        <div
          aria-hidden
          className="absolute -top-20 -right-10 size-64 rounded-full bg-primary/15 blur-3xl"
        />
        <Waveform
          bars={48}
          progress={100}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-10"
        />

        <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-3 lg:items-center">
          <div className="space-y-5 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-accent opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-accent" />
                </span>
                {t("eyebrow")}
              </Badge>
            </div>

            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <ShareConversationDialog topics={topics} />
              <Button variant="outline" size="xl" onClick={handleExplore}>
                <ArrowDown aria-hidden />
                {t("exploreCta")}
              </Button>
            </div>
          </div>

          <div className="lg:border-l lg:border-border lg:pl-8">
            <StatStrip
              className="grid-cols-2"
              items={[
                {
                  value: compactNumber(statsQuery.data?.meta.total ?? 0),
                  label: t("statConversations"),
                },
                {
                  value: String(topics.length),
                  label: t("statTopics"),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <SectionNav value={section} onChange={setSection} />
          <HowItWorksCard />
        </div>

        <div className="space-y-6 lg:col-span-6">
          {featured ? (
            <FeaturedConversation
              conversation={featured}
              isPlaying={featuredIsPlaying}
              isSaved={savedIds.has(featured.id)}
              progress={featuredProgress}
              elapsedSec={playing?.id === featured.id ? elapsed : 0}
              onPlay={() => handlePlay(featured)}
              onToggleSave={() => toggleSave.mutate(featured.id)}
              onShare={() => void handleShare(featured)}
            />
          ) : null}

          <section id="chatting-topics" className="space-y-3 scroll-mt-24">
            <header>
              <h2 className="font-heading text-base font-medium">
                {t("topicsTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("topicsDescription")}
              </p>
            </header>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={topicId === null ? "default" : "outline"}
                aria-pressed={topicId === null}
                onClick={() => setTopicId(null)}
              >
                {t("allTopics")}
              </Button>

              {topicsQuery.isPending
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-24 rounded-xl" />
                  ))
                : visibleTopics.map((topic) => (
                    <Button
                      key={topic._id}
                      variant={topicId === topic._id ? "default" : "outline"}
                      aria-pressed={topicId === topic._id}
                      onClick={() => handleSelectTopic(topic._id)}
                    >
                      {topic.name}
                    </Button>
                  ))}

              {!topicsQuery.isPending && (topics.length > INITIAL_VISIBLE_TOPICS || showAllTopics) && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllTopics((prev) => !prev)}
                  className="gap-1 border-dashed"
                >
                  {showAllTopics ? (
                    <>
                      <span>{t("topicsLess")}</span>
                      <ChevronUp className="size-3.5" aria-hidden />
                    </>
                  ) : (
                    <>
                      <span>{t("topicsMore", { count: hiddenCount })}</span>
                      <ChevronDown className="size-3.5" aria-hidden />
                    </>
                  )}
                </Button>
              )}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-base font-medium">
              {t(sectionLabelKey(section))}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("conversationsCount", { count: totalCount })}
            </p>
          </div>

          {pendingAudio.length ? (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <Loader2
                className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {t("pendingReview", { count: pendingAudio.length })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("pendingReviewDescription")}
                </p>
              </div>
            </div>
          ) : null}

          {feedQuery.isPending ? (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-2xl" />
              ))}
            </section>
          ) : feedQuery.isError ? (
            <EmptyState
              icon={<Headphones className="size-5" aria-hidden />}
              title={t("loadErrorTitle")}
              description={t("loadErrorDescription")}
              action={
                <Button
                  variant="outline"
                  onClick={() => void feedQuery.refetch()}
                >
                  {t("loadErrorAction")}
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Headphones className="size-5" aria-hidden />}
              title={t("emptyFilterTitle")}
              description={t("emptyFilterDescription")}
              action={
                <Button variant="outline" onClick={() => setTopicId(null)}>
                  {t("emptyFilterAction")}
                </Button>
              }
            />
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {visible.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isPlaying={
                    playing?.id === conversation.id &&
                    isPlaying &&
                    elapsed < conversation.durationSec
                  }
                  isSaved={savedIds.has(conversation.id)}
                  onPlay={() => handlePlay(conversation)}
                  onToggleSave={() => toggleSave.mutate(conversation.id)}
                  onShare={() => void handleShare(conversation)}
                />
              ))}
            </section>
          )}
        </div>

        <div className="lg:col-span-3">
          <SideRail
            topics={topics}
            voices={voices}
            activeTopicId={topicId}
            onSelectTopic={handleSelectTopic}
          />
        </div>
      </div>

      {playing ? (
        <MiniPlayer
          conversation={playing}
          isPlaying={isPlaying}
          elapsedSec={elapsed}
          muted={muted}
          onToggle={() => handlePlay(playing)}
          onBack={() => seekBy(-15)}
          onForward={() => seekBy(15)}
          onToggleMute={() => setMuted((value) => !value)}
          onClose={closePlayer}
        />
      ) : null}
    </div>
  );
}
