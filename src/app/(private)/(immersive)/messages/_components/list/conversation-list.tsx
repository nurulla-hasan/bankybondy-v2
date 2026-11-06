"use client";

import Link from "next/link";
import { MessageSquare, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import type { RawConversationList } from "@/types";

import { ConversationListSkeleton } from "./conversation-list-skeleton";
import { ConversationRow } from "./conversation-row";

interface ConversationListProps {
  data: RawConversationList | null;
  isPending: boolean;
  isError: boolean;
  meId: string;
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  onRetry: () => void;
}

export function ConversationList({
  data,
  isPending,
  isError,
  meId,
  selectedId,
  onSelect,
  onRetry,
}: ConversationListProps) {
  const t = useTranslations("Messages");

  if (isError) {
    return (
      <EmptyState
        icon={<WifiOff className="size-5" aria-hidden />}
        title={t("errorTitle")}
        description={t("errorDescription")}
        action={
          <Button variant="outline" onClick={onRetry}>
            {t("retry")}
          </Button>
        }
      />
    );
  }

  if (isPending) return <ConversationListSkeleton />;

  const conversations = data?.data ?? [];

  if (!conversations.length) {
    return (
      <EmptyState
        icon={<MessageSquare className="size-5" aria-hidden />}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Button variant="outline" render={<Link href="/people" />}>
            {t("emptyAction")}
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-1">
      {conversations.map((conversation) => (
        <li key={conversation._id}>
          <ConversationRow
            conversation={conversation}
            meId={meId}
            isSelected={conversation._id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
