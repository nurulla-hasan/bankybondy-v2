"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RawAudioTopicWithCount } from "@/types";

const MOBILE_VISIBLE_TOPICS = 6;
const DESKTOP_VISIBLE_TOPICS = 10;

interface TopicFiltersProps {
  activeTopicId: string | null;
  isPending: boolean;
  onSelectTopic: (topicId: string | null) => void;
  topics: readonly RawAudioTopicWithCount[];
}

export function TopicFilters({
  activeTopicId,
  isPending,
  onSelectTopic,
  topics,
}: TopicFiltersProps) {
  const t = useTranslations("Chatting");
  const [showAllTopics, setShowAllTopics] = useState(false);

  const visibleTopics = useMemo(() => {
    const initialTopics = topics.slice(0, DESKTOP_VISIBLE_TOPICS);
    if (
      showAllTopics ||
      !activeTopicId ||
      initialTopics.some((topic) => topic._id === activeTopicId)
    ) {
      return initialTopics;
    }

    const selectedTopic = topics.find((topic) => topic._id === activeTopicId);
    return selectedTopic
      ? [...initialTopics.slice(0, DESKTOP_VISIBLE_TOPICS - 1), selectedTopic]
      : initialTopics;
  }, [activeTopicId, showAllTopics, topics]);

  const extraTopics = showAllTopics
    ? topics.filter(
        (topic) => !visibleTopics.some((visible) => visible._id === topic._id),
      )
    : [];

  const canToggle = !isPending && topics.length > MOBILE_VISIBLE_TOPICS;

  return (
    <section id="chatting-topics" className="space-y-3 scroll-mt-24">
      <div className="flex items-start justify-between gap-3">
        <header>
          <h2 className="font-heading text-base font-medium">
            {t("topicsTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("topicsDescription")}
          </p>
        </header>

        {canToggle ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTopics((value) => !value)}
            aria-expanded={showAllTopics}
            className="shrink-0 text-muted-foreground"
          >
            {showAllTopics ? (
              <>
                {t("topicsLess")}
                <ChevronUp aria-hidden />
              </>
            ) : (
              <>
                {t("topicsShowMore")}
                <ChevronDown aria-hidden />
              </>
            )}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTopicId === null ? "default" : "outline"}
          aria-pressed={activeTopicId === null}
          onClick={() => onSelectTopic(null)}
        >
          {t("allTopics")}
        </Button>

        {isPending
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-xl" />
            ))
          : [...visibleTopics, ...extraTopics].map((topic, index) => {
              const compactOnly =
                index >= MOBILE_VISIBLE_TOPICS &&
                index < DESKTOP_VISIBLE_TOPICS &&
                !showAllTopics &&
                topic._id !== activeTopicId;

              return (
                <Button
                  key={topic._id}
                  variant={activeTopicId === topic._id ? "default" : "outline"}
                  aria-pressed={activeTopicId === topic._id}
                  onClick={() => onSelectTopic(topic._id)}
                  className={cn(compactOnly && "hidden sm:inline-flex")}
                >
                  {topic.name}
                  {topic.totalAudios > 0 ? (
                    <span
                      className="hidden text-xs font-normal tabular-nums opacity-60 sm:inline"
                      aria-hidden
                    >
                      {topic.totalAudios}
                    </span>
                  ) : null}
                </Button>
              );
            })}
      </div>
    </section>
  );
}
