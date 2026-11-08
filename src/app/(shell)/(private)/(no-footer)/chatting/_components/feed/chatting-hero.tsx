"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatStrip } from "@/components/common/stat-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RawAudioTopicWithCount } from "@/types";

import { ShareConversationDialog } from "../dialogs/share-conversation-dialog";
import { compactNumber } from "../shared/format";
import { Waveform } from "../shared/waveform";

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

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
      <motion.div
        aria-hidden
        className="absolute -top-20 -right-10 size-64 rounded-full bg-primary/15 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 24, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <Waveform
        animated
        bars={48}
        progress={100}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-10"
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-3 lg:items-center"
      >
        <div className="space-y-5 lg:col-span-2">
          <motion.div variants={rise}>
            <Badge variant="secondary">
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-accent opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-accent" />
              </span>
              {t("eyebrow")}
            </Badge>
          </motion.div>

          <motion.h1
            variants={rise}
            className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            variants={rise}
            className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div variants={rise} className="flex flex-wrap items-center gap-2">
            <ShareConversationDialog topics={topics} />
            <Button variant="outline" size="xl" onClick={onExplore}>
              <ArrowDown aria-hidden />
              {t("exploreCta")}
            </Button>
          </motion.div>
        </div>

        <motion.div variants={rise} className="lg:border-l lg:border-border lg:pl-8">
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
        </motion.div>
      </motion.div>
    </section>
  );
}