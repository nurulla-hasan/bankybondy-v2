"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, Headphones, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { StatStrip } from "@/components/common/stat-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { ConversationCard } from "./conversation-card";
import { FeaturedConversation } from "./featured-conversation";
import { compactNumber } from "./format";
import { HowItWorksCard } from "./how-it-works-card";
import { MiniPlayer } from "./mini-player";
import {
  MOCK_CONVERSATIONS,
  MOCK_FEATURED,
  MOCK_TOPIC_ENTRIES,
  MOCK_TOPIC_LIST,
  MOCK_TOPICS,
  MOCK_TOTAL_AUDIOS,
  type MockConversation,
  type MockTopicId,
} from "./mock-data";
import { SectionNav, sectionLabelKey, type FeedSection } from "./section-nav";
import { ShareConversationDialog } from "./share-conversation-dialog";
import { SideRail } from "./side-rail";
import { Waveform } from "./waveform";

const SECTION_SORTERS: Record<
  FeedSection,
  (a: MockConversation, b: MockConversation) => number
> = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  trending: (a, b) => b.trendingScore - a.trendingScore,
  mostPlayed: (a, b) => b.totalPlay - a.totalPlay,
};

export function ChattingFeed() {
  const t = useTranslations("Chatting");

  const [section, setSection] = useState<FeedSection>("recent");
  const [topic, setTopic] = useState<MockTopicId | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Design-preview player: a countdown for the mock waveform, nothing else.
  const [playing, setPlaying] = useState<MockConversation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isPlaying || !playing) return;

    const timer = window.setInterval(() => {
      setElapsed((value) => Math.min(value + 1, playing.durationSec));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, playing]);

  const visible = useMemo(() => {
    const base = MOCK_CONVERSATIONS.slice(1);
    const filtered = topic
      ? base.filter((item) => item.topic.id === MOCK_TOPICS[topic].id)
      : base;

    return [...filtered].sort(SECTION_SORTERS[section]);
  }, [section, topic]);

  const handlePlay = (conversation: MockConversation) => {
    if (playing?.id === conversation.id) {
      if (elapsed >= conversation.durationSec) {
        setElapsed(0);
        setIsPlaying(true);
        return;
      }
      setIsPlaying((value) => !value);
      return;
    }

    setPlaying(conversation);
    setElapsed(0);
    setIsPlaying(true);
  };

  const handleToggleSave = (conversationId: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(conversationId)) next.delete(conversationId);
      else next.add(conversationId);
      return next;
    });
  };

  const handleShare = async (conversation: MockConversation) => {
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

  const handleSelectTopic = (nextTopic: MockTopicId) => {
    setTopic((current) => (current === nextTopic ? null : nextTopic));
  };

  const featuredIsPlaying =
    playing?.id === MOCK_FEATURED.id &&
    isPlaying &&
    elapsed < MOCK_FEATURED.durationSec;
  const featuredProgress =
    playing?.id === MOCK_FEATURED.id
      ? (elapsed / MOCK_FEATURED.durationSec) * 100
      : 0;

  const closePlayer = () => {
    setPlaying(null);
    setIsPlaying(false);
    setElapsed(0);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 px-4 pt-5 pb-8 md:px-6 lg:pb-12",
        playing && "pb-24",
      )}
    >
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
              <Badge variant="outline">
                <Sparkles aria-hidden />
                {t("previewBadge")}
              </Badge>
            </div>

            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <ShareConversationDialog />
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
                  value: compactNumber(MOCK_TOTAL_AUDIOS),
                  label: t("statConversations"),
                },
                {
                  value: String(MOCK_TOPIC_LIST.length),
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
          <HowItWorksCard className="hidden lg:block" />
        </div>

        <div className="space-y-6 lg:col-span-6">
          {section === "recent" && topic === null ? (
            <FeaturedConversation
              conversation={MOCK_FEATURED}
              isPlaying={featuredIsPlaying}
              isSaved={saved.has(MOCK_FEATURED.id)}
              progress={featuredProgress}
              elapsedSec={
                playing?.id === MOCK_FEATURED.id ? elapsed : 0
              }
              onPlay={() => handlePlay(MOCK_FEATURED)}
              onToggleSave={() => handleToggleSave(MOCK_FEATURED.id)}
              onShare={() => void handleShare(MOCK_FEATURED)}
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
                variant={topic === null ? "default" : "outline"}
                aria-pressed={topic === null}
                onClick={() => setTopic(null)}
              >
                {t("allTopics")}
              </Button>

              {MOCK_TOPIC_ENTRIES.map((entry) => (
                <Button
                  key={entry.key}
                  variant={topic === entry.key ? "default" : "outline"}
                  aria-pressed={topic === entry.key}
                  onClick={() => handleSelectTopic(entry.key)}
                >
                  {entry.topic.name}
                </Button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-base font-medium">
              {t(sectionLabelKey(section))}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("conversationsCount", { count: visible.length })}
            </p>
          </div>

          {visible.length ? (
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
                  isSaved={saved.has(conversation.id)}
                  onPlay={() => handlePlay(conversation)}
                  onToggleSave={() => handleToggleSave(conversation.id)}
                  onShare={() => void handleShare(conversation)}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              icon={<Headphones className="size-5" aria-hidden />}
              title={t("emptyFilterTitle")}
              description={t("emptyFilterDescription")}
              action={
                <Button variant="outline" onClick={() => setTopic(null)}>
                  {t("emptyFilterAction")}
                </Button>
              }
            />
          )}
        </div>

        <div className="lg:col-span-3">
          <SideRail onSelectTopic={handleSelectTopic} />
        </div>
      </div>

      {playing ? (
        <MiniPlayer
          conversation={playing}
          isPlaying={isPlaying}
          elapsedSec={elapsed}
          onToggle={() => handlePlay(playing)}
          onBack={() => setElapsed((value) => Math.max(0, value - 15))}
          onForward={() =>
            setElapsed((value) =>
              Math.min(playing.durationSec, value + 15),
            )
          }
          onClose={closePlayer}
        />
      ) : null}
    </div>
  );
}
