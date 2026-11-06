"use client";

import { MessagesSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";

export function NoConversationState() {
  const t = useTranslations("Messages");

  return (
    <EmptyState
      icon={<MessagesSquare className="size-5" aria-hidden />}
      title={t("noConversationTitle")}
      description={t("noConversationDescription")}
    />
  );
}
