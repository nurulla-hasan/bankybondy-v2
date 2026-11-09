"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RawAudioTopicWithCount } from "@/types";

const COLLAPSED_COUNT = 9;

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

  const initialTopics = useMemo(() => {
    return topics.slice(0, COLLAPSED_COUNT);
  }, [topics]);

  const extraTopics = useMemo(() => {
    return topics.slice(COLLAPSED_COUNT);
  }, [topics]);

  const canToggle = !isPending && topics.length > COLLAPSED_COUNT;

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
            className="shrink-0 text-muted-foreground cursor-pointer"
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
          className="shrink-0"
        >
          {t("allTopics")}
        </Button>

        {isPending
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-20 rounded-xl" />
            ))
          : initialTopics.map((topic) => (
              <Button
                key={topic._id}
                variant={activeTopicId === topic._id ? "default" : "outline"}
                aria-pressed={activeTopicId === topic._id}
                onClick={() => onSelectTopic(topic._id)}
                className="shrink-0"
              >
                <span>{topic.name}</span>
                {topic.totalAudios > 0 ? (
                  <span
                    className="hidden text-xs font-normal tabular-nums opacity-60 sm:inline ml-1"
                    aria-hidden
                  >
                    {topic.totalAudios}
                  </span>
                ) : null}
              </Button>
            ))}
      </div>

      <AnimatePresence initial={false}>
        {showAllTopics && (
          <motion.div
            key="extra-topics"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.25, ease: "easeInOut" },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: "easeInOut" },
                opacity: { duration: 0.15 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mt-2">
              {extraTopics.map((topic) => (
                <Button
                  key={topic._id}
                  variant={activeTopicId === topic._id ? "default" : "outline"}
                  aria-pressed={activeTopicId === topic._id}
                  onClick={() => onSelectTopic(topic._id)}
                  className="shrink-0"
                >
                  <span>{topic.name}</span>
                  {topic.totalAudios > 0 ? (
                    <span
                      className="hidden text-xs font-normal tabular-nums opacity-60 sm:inline ml-1"
                      aria-hidden
                    >
                      {topic.totalAudios}
                    </span>
                  ) : null}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
