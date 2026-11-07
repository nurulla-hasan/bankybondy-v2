"use client";

import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatStrip } from "@/components/common/stat-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RawAudioTopicWithCount } from "@/types";

import { ShareConversationDialog } from "../dialogs/share-conversation-dialog";
import { compactNumber } from "../shared/format";
import { Waveform } from "../shared/waveform";

interface ChattingHeroProps {
  conversationCount: number;
  onExplore: () => void;
  topics: readonly RawAudioTopicWithCount[];
}

export function ChattingHero({
  conversationCount,
  onExplore,
  topics,
}: ChattingHeroProps) {
  const t = useTranslations("Chatting");

  return (
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
          <Badge variant="secondary">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-accent" />
            </span>
            {t("eyebrow")}
          </Badge>

          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>

          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <ShareConversationDialog topics={topics} />
            <Button variant="outline" size="xl" onClick={onExplore}>
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
                value: compactNumber(conversationCount),
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
  );
}
