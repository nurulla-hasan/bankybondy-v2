"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Headphones, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useNextFilter } from "@/hooks/useNextFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  FEED_PAGE_SIZE,
  useAudioFeed,
  useInfiniteAudioFeed,
  useAudioTopics,
  useBookmarkedAudioIds,
  useToggleAudioBookmark,
} from "@/services/hooks/audio.hook";
import type { AudioFeedSort, AudioListQueryParams } from "@/types";

import { ConversationCard } from "../cards/conversation-card";
import { FeaturedConversation } from "../cards/featured-conversation";
import { HowItWorksCard } from "../cards/how-it-works-card";
import { ConversationDetail } from "../detail/conversation-detail";
import { AudioModerationWatcher } from "../moderation/moderation-watcher";
import { Favorites } from "../panels/favorites";
import { MyContent } from "../panels/my-content";
import { SideRail } from "../panels/side-rail";
import { MiniPlayer } from "../player/mini-player";
import {
  toFeedAudio,
  toFeedVoices,
  type FeedAudio,
} from "../shared/audio-model";
import { usePendingAudio } from "../shared/moderation-tracker";
import { useAudioPlayer } from "../shared/use-audio-player";
import { ChattingHero } from "./chatting-hero";
import {
  isFeedSection,
  SectionNav,
  sectionLabelKey,
  type FeedSection,
} from "./section-nav";
import { TopicFilters } from "./topic-filters";

const SECTION_SORT = {
  recent: "-createdAt",
  trending: "-trendingScore",
  mostPlayed: "-totalPlay",
} as const satisfies Record<"recent" | "trending" | "mostPlayed", AudioFeedSort>;

const SECTIONS: readonly FeedSection[] = [
  "recent",
  "trending",
  "mostPlayed",
  "favorites",
  "myContent",
];

type ChattingFilterKey = "section" | "topic";

function isChattingSection(value: string): value is FeedSection {
  return SECTIONS.includes(value as FeedSection);
}

interface ChattingFeedProps {
  conversationId?: string;
}

export function ChattingFeed({ conversationId }: ChattingFeedProps) {
  const t = useTranslations("Chatting");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getFilter, updateBatch } = useNextFilter<ChattingFilterKey>();
  const sectionValue = getFilter("section", "recent");
  const section = isChattingSection(sectionValue) ? sectionValue : "recent";
  const topicId = getFilter("topic") || null;
  const pendingAudio = usePendingAudio();
  const listAnchorRef = useRef<HTMLDivElement | null>(null);

  // Old shared links point at the feed with `?c=<id>`; send them to the
  // conversation page without leaving a redirect entry in the history.
  useEffect(() => {
    const target = searchParams.get("c");
    if (target) {
      router.replace(`/chatting/conversations/${encodeURIComponent(target)}`);
    }
  }, [searchParams, router]);

  const feedParams = useMemo<Omit<AudioListQueryParams, "page">>(
    () => ({
      limit: FEED_PAGE_SIZE,
      sort: isFeedSection(section) ? SECTION_SORT[section] : "-createdAt",
      audioTopic: topicId ?? undefined,
    }),
    [section, topicId],
  );

  const feedQuery = useInfiniteAudioFeed(feedParams);
  const statsQuery = useAudioFeed({ page: 1, limit: 1 });
  const topicsQuery = useAudioTopics();
  const savedQuery = useBookmarkedAudioIds();
  const toggleSave = useToggleAudioBookmark();

  const items = useMemo(
    () =>
      (feedQuery.data?.pages.flatMap((page) => page.data.result) ?? [])
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

  const featured =
    section === "recent" && topicId === null ? items[0] : undefined;
  const visible = featured ? items.slice(1) : items;
  const totalCount =
    feedQuery.data?.pages[feedQuery.data.pages.length - 1]?.data.meta.total ??
    items.length;
  const hasMore = feedQuery.hasNextPage;

  const {
    closePlayer,
    elapsed,
    isPlaying,
    muted,
    playing,
    seekBy,
    setMuted,
    togglePlayback,
  } = useAudioPlayer();

  const handleSelectTopic = (nextTopicId: string | null) => {
    const topic = topicId === nextTopicId ? null : nextTopicId;
    updateBatch({ topic }, { resetPage: false });
  };

  const handleSectionChange = (nextSection: FeedSection) => {
    if (conversationId) {
      router.push("/chatting");
      return;
    }

    updateBatch(
      { section: nextSection === "recent" ? null : nextSection },
      { resetPage: false },
    );
  };

  const handleLoadMore = () => {
    void feedQuery.fetchNextPage();
  };

  const handleShare = async (conversation: FeedAudio) => {
    try {
      const url = `${window.location.origin}/chatting/conversations/${conversation.id}`;

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

      <ChattingHero
        conversationCount={statsQuery.data?.meta.total ?? 0}
        onExplore={handleExplore}
        topics={topics}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <SectionNav value={section} onChange={handleSectionChange} />
          <HowItWorksCard />
        </div>

        <div className="space-y-6 lg:col-span-6">
          {conversationId ? (
            <ConversationDetail audioId={conversationId} />
          ) : isFeedSection(section) ? (
            <>
          {featured ? (
            <FeaturedConversation
              conversation={featured}
              isPlaying={featuredIsPlaying}
              isSaved={savedIds.has(featured.id)}
              progress={featuredProgress}
              elapsedSec={playing?.id === featured.id ? elapsed : 0}
              onPlay={() => togglePlayback(featured)}
              onToggleSave={() => toggleSave.mutate(featured.id)}
              onShare={() => void handleShare(featured)}
            />
          ) : null}

          <TopicFilters
            activeTopicId={topicId}
            isPending={topicsQuery.isPending}
            onSelectTopic={handleSelectTopic}
            topics={topics}
          />

          <div ref={listAnchorRef} aria-hidden className="scroll-mt-24" />

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
                <Button
                  variant="outline"
                  onClick={() =>
                    updateBatch({ topic: null }, { resetPage: false })
                  }
                >
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
                  onPlay={() => togglePlayback(conversation)}
                  onToggleSave={() => toggleSave.mutate(conversation.id)}
                  onShare={() => void handleShare(conversation)}
                />
              ))}
            </section>
          )}

          {hasMore ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                loading={feedQuery.isFetchingNextPage}
                loadingText={t("loadMore")}
                onClick={handleLoadMore}
              >
                {t("loadMore")}
              </Button>
            </div>
          ) : null}
            </>
          ) : section === "favorites" ? (
            <Favorites embedded />
          ) : (
            <MyContent embedded />
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
          onToggle={() => togglePlayback(playing)}
          onBack={() => seekBy(-15)}
          onForward={() => seekBy(15)}
          onToggleMute={() => setMuted((value) => !value)}
          onClose={closePlayer}
        />
      ) : null}
    </div>
  );
}
