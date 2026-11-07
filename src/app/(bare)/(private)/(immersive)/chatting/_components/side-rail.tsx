"use client";

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
import { getInitials } from "@/lib/utils";

import {
  MOCK_TOPIC_ENTRIES,
  MOCK_TOPICS,
  MOCK_VOICES,
  type MockTopicId,
} from "./mock-data";

const TOP_TOPICS = [...MOCK_TOPIC_ENTRIES]
  .sort((a, b) => b.topic.totalAudios - a.topic.totalAudios)
  .slice(0, 5);

interface SideRailProps {
  onSelectTopic: (topic: MockTopicId) => void;
}

export function SideRail({ onSelectTopic }: SideRailProps) {
  const t = useTranslations("Chatting");

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card>
        <CardHeader>
          <CardTitle>{t("voicesTitle")}</CardTitle>
          <CardDescription>{t("voicesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {MOCK_VOICES.map((voice) => (
            <div
              key={voice.id}
              className="flex items-center gap-2 rounded-lg px-1 py-1.5"
            >
              <Avatar size="sm">
                <AvatarImage alt={voice.name} />
                <AvatarFallback>{getInitials(voice.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{voice.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {MOCK_TOPICS[voice.topicId].name}
                  <span aria-hidden> · </span>
                  {t("trendingCount", { count: voice.conversations })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("trendingTitle")}</CardTitle>
          <CardDescription>{t("trendingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1">
            {TOP_TOPICS.map((entry, index) => (
              <li key={entry.key}>
                <button
                  type="button"
                  onClick={() => onSelectTopic(entry.key)}
                  className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {entry.topic.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t("trendingCount", { count: entry.topic.totalAudios })}
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
