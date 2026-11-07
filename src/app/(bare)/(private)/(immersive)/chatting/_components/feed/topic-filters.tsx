"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RawAudioTopicWithCount } from "@/types";

const INITIAL_VISIBLE_TOPICS = 6;

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
  const extraTopicsId = useId();
  const reduceMotion = useReducedMotion();

  const visibleTopics = useMemo(() => {
    const initialTopics = topics.slice(0, INITIAL_VISIBLE_TOPICS);
    if (
      showAllTopics ||
      !activeTopicId ||
      initialTopics.some((topic) => topic._id === activeTopicId)
    ) {
      return initialTopics;
    }

    const selectedTopic = topics.find((topic) => topic._id === activeTopicId);
    return selectedTopic
      ? [...initialTopics.slice(0, INITIAL_VISIBLE_TOPICS - 1), selectedTopic]
      : initialTopics;
  }, [activeTopicId, showAllTopics, topics]);

  const extraTopics = topics.filter(
    (topic) => !visibleTopics.some((visible) => visible._id === topic._id),
  );

  return (
    <section id="chatting-topics" className="space-y-3 scroll-mt-24">
      <header>
        <h2 className="font-heading text-base font-medium">{t("topicsTitle")}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("topicsDescription")}
        </p>
      </header>

      <div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTopicId === null ? "default" : "outline"}
            aria-pressed={activeTopicId === null}
            onClick={() => onSelectTopic(null)}
          >
            {t("allTopics")}
          </Button>

          {isPending
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-24 rounded-xl" />
              ))
            : visibleTopics.map((topic) => (
                <Button
                  key={topic._id}
                  variant={activeTopicId === topic._id ? "default" : "outline"}
                  aria-pressed={activeTopicId === topic._id}
                  onClick={() => onSelectTopic(topic._id)}
                >
                  {topic.name}
                </Button>
              ))}

          {!isPending && (topics.length > INITIAL_VISIBLE_TOPICS || showAllTopics) ? (
            <Button
              variant="outline"
              onClick={() => setShowAllTopics((value) => !value)}
              aria-expanded={showAllTopics}
              aria-controls={extraTopicsId}
              className="gap-1 border-dashed"
            >
              {showAllTopics ? (
                <>
                  <span>{t("topicsLess")}</span>
                  <ChevronUp className="size-3.5" aria-hidden />
                </>
              ) : (
                <>
                  <span>{t("topicsMore", { count: extraTopics.length })}</span>
                  <ChevronDown className="size-3.5" aria-hidden />
                </>
              )}
            </Button>
          ) : null}
        </div>

        <motion.div
          id={extraTopicsId}
          initial={false}
          animate={{ height: showAllTopics ? "auto" : 0, opacity: showAllTopics ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
          aria-hidden={!showAllTopics}
          inert={!showAllTopics}
        >
          <div className="flex flex-wrap gap-2 pt-2">
            {extraTopics.map((topic) => (
              <Button
                key={topic._id}
                variant={activeTopicId === topic._id ? "default" : "outline"}
                aria-pressed={activeTopicId === topic._id}
                onClick={() => onSelectTopic(topic._id)}
              >
                {topic.name}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
