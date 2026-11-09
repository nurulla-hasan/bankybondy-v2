"use client";

import { ArrowLeft, Ban, EllipsisVertical, Handshake, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { RawBondLinkStatus, RawConversationListItem } from "@/types";

import { GroupAvatarStack } from "../list/group-avatar-stack";
import { getConversationTitle } from "../shared/conversation-title";
import { ChatInfoSheet } from "./chat-info-sheet";

const BOND_STATUS_VARIANT: Record<RawBondLinkStatus, "progress" | "completed" | "rejected"> = {
  Ongoing: "progress",
  Completed: "completed",
  Canceled: "rejected",
};

interface ThreadHeaderProps {
  conversation: RawConversationListItem;
  onBack: () => void;
  onHide: () => void;
}

export function ThreadHeader({ conversation, onBack, onHide }: ThreadHeaderProps) {
  const t = useTranslations("Messages");
  const [infoOpen, setInfoOpen] = useState(false);

  const peer = conversation.userData;
  const bondLink = conversation.bondLink;

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onBack}
        aria-label={t("back")}
      >
        <ArrowLeft />
      </Button>

      {conversation.type === "one-two-one" ? (
        peer?._id ? (
          <Link
            href={`/people/${peer._id}`}
            className="shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar size="lg">
              <AvatarImage src={peer.profile_image} alt={peer.name ?? ""} />
              <AvatarFallback>{getInitials(peer.name ?? "")}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar size="lg" className="shrink-0">
            <AvatarImage src={peer?.profile_image} alt={peer?.name ?? ""} />
            <AvatarFallback>{getInitials(peer?.name ?? "")}</AvatarFallback>
          </Avatar>
        )
      ) : (
        <GroupAvatarStack members={conversation.members} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {bondLink ? (
            <Handshake className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          ) : null}
          <h3 className="truncate font-heading text-sm font-medium">
            {conversation.type === "one-two-one" && peer?._id ? (
              <Link
                href={`/people/${peer._id}`}
                className="transition-colors hover:text-primary"
              >
                {getConversationTitle(conversation, undefined)}
              </Link>
            ) : (
              getConversationTitle(
                conversation,
                conversation.type === "bond-link-group"
                  ? t("bondRoomFallback")
                  : undefined,
              )
            )}
          </h3>
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          {bondLink ? (
            <Badge variant={BOND_STATUS_VARIANT[bondLink.status]}>
              {t(`bondLinkStatus.${bondLink.status}`)}
            </Badge>
          ) : null}

          {conversation.type !== "one-two-one" ? (
            <p className="truncate text-xs text-muted-foreground">
              {t("groupMembers", { count: conversation.members.length })}
            </p>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={t("actions")} />
          }
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setInfoOpen(true)}>
            <Info aria-hidden />
            {t("infoTitle")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onHide}>
            <Ban aria-hidden />
            {t("hide")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChatInfoSheet
        conversation={conversation}
        open={infoOpen}
        onOpenChange={setInfoOpen}
        onOpenMedia={() => setInfoOpen(false)}
      />
    </header>
  );
}
