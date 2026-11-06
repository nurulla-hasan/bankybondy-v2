"use client";

import { Handshake } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";
import type { RawChatLastMessage, RawConversationListItem } from "@/types";

import { ChatTimestamp } from "../shared/chat-timestamp";
import { getConversationTitle } from "../shared/conversation-title";
import { GroupAvatarStack } from "./group-avatar-stack";

const UNSEEN_CAP = 99;

interface ConversationRowProps {
  conversation: RawConversationListItem;
  meId: string;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
}

export function ConversationRow({
  conversation,
  meId,
  isSelected,
  onSelect,
}: ConversationRowProps) {
  const t = useTranslations("Messages");

  const unseen = conversation.unseenMsg;
  const peer = conversation.userData;

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation._id)}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted",
        isSelected && "bg-muted",
      )}
    >
      {conversation.type === "one-two-one" ? (
        <Avatar size="lg" className="shrink-0">
          <AvatarImage src={peer?.profile_image} alt={peer?.name ?? ""} />
          <AvatarFallback>{getInitials(peer?.name ?? "")}</AvatarFallback>
        </Avatar>
      ) : (
        <GroupAvatarStack members={conversation.members} />
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {conversation.type === "bond-link-group" ? (
              <Handshake
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            ) : null}

            <span
              className={cn(
                "truncate text-sm",
                unseen ? "font-semibold text-foreground" : "font-medium",
              )}
            >
              {getConversationTitle(conversation)}
            </span>
          </span>

          <ChatTimestamp
            date={conversation.lastMessage?.createdAt ?? conversation.updated_at}
            className="shrink-0 text-xs text-muted-foreground"
          />
        </span>

        <span className="mt-0.5 flex items-center gap-2">
          <Preview
            lastMessage={conversation.lastMessage}
            mine={conversation.lastMessage?.msgByUserId === meId}
          />

          {unseen > 0 ? (
            <Badge className="shrink-0">
              {unseen > UNSEEN_CAP ? t("unseenCap") : unseen}
            </Badge>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function Preview({
  lastMessage,
  mine,
}: {
  lastMessage: RawChatLastMessage | null;
  mine: boolean;
}) {
  const t = useTranslations("Messages");

  if (!lastMessage) return <span className="min-w-0 flex-1" />;

  /**
   * The chat list ships `lastMessage` untrimmed, so a deleted message still
   * carries its text over the wire — never render it
   * (`conversation.service.ts:81-94`).
   */
  const summary = lastMessage.isDeleted
    ? t("deletedMessage")
    : (lastMessage.imageUrl?.length
      ? t("attachmentImage", { count: lastMessage.imageUrl.length })
      : lastMessage.videoUrl?.length
        ? t("attachmentVideo", { count: lastMessage.videoUrl.length })
        : lastMessage.pdfUrl?.length
          ? t("attachmentPdf", { count: lastMessage.pdfUrl.length })
          : lastMessage.text);

  return (
    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
      {mine ? <span className="text-foreground/70">{t("you")}: </span> : null}
      {summary}
    </span>
  );
}
