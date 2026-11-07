"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RawAudioTopicWithCount } from "@/types";
import { cn, getInitials } from "@/lib/utils";

import type { FeedVoice } from "../shared/audio-model";

interface SideRailProps {
  topics: readonly RawAudioTopicWithCount[];
  voices: readonly FeedVoice[];
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
}

export function SideRail({
  topics,
  voices,
  activeTopicId,
  onSelectTopic,
}: SideRailProps) {
  const t = useTranslations("Chatting");

  const topTopics = useMemo(
    () =>
      [...topics].sort((a, b) => b.totalAudios - a.totalAudios).slice(0, 5),
    [topics],
  );

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {voices.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("voicesTitle")}</CardTitle>
            <CardDescription>{t("voicesDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center gap-2 rounded-lg px-1 py-1.5"
              >
                <Avatar size="sm">
                  <AvatarImage alt={voice.name} src={voice.profileImage} />
                  <AvatarFallback>{getInitials(voice.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{voice.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {voice.topicName}
                    <span aria-hidden> · </span>
                    {t("trendingCount", { count: voice.count })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("trendingTitle")}</CardTitle>
          <CardDescription>{t("trendingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1">
            {topTopics.map((topic, index) => (
              <li key={topic._id}>
                <button
                  type="button"
                  onClick={() => onSelectTopic(topic._id)}
                  aria-pressed={activeTopicId === topic._id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-1.5 text-left transition-colors hover:bg-muted",
                    activeTopicId === topic._id && "bg-muted",
                  )}
                >
                  <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {topic.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t("trendingCount", { count: topic.totalAudios })}
                    </span>
                  </span>
                  <TrendingUp
                    className="size-4 shrink-0 text-emerald-accent"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </aside>
  );
}
