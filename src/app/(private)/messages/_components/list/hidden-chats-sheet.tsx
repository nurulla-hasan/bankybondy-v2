"use client";

import { ArchiveRestore, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getInitials } from "@/lib/utils";
import { useHiddenChats, useUnhideConversation } from "@/services/hooks/chat.hook";
import type { RawConversationListItem } from "@/types";

import { GroupAvatarStack } from "./group-avatar-stack";
import { getConversationTitle } from "../shared/conversation-title";

interface HiddenChatsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Restoring a row closes the sheet and opens that chat. */
  onRestored: (conversationId: string) => void;
}

export function HiddenChatsSheet({
  open,
  onOpenChange,
  onRestored,
}: HiddenChatsSheetProps) {
  const t = useTranslations("Messages");
  const hidden = useHiddenChats();
  const unhide = useUnhideConversation();

  const rows = hidden.data?.data ?? [];

  const restore = (conversationId: string) => {
    unhide.mutate(conversationId, {
      onSuccess: () => onRestored(conversationId),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("hiddenTitle")}</SheetTitle>
          <SheetDescription>{t("hiddenDescription")}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
          {hidden.isPending ? (
            <p className="py-4 text-center text-xs text-muted-foreground">…</p>
          ) : rows.length ? (
            <ul className="flex flex-col gap-1">
              {rows.map((row) => (
                <HiddenRow
                  key={row._id}
                  conversation={row}
                  pending={unhide.isPending && unhide.variables === row._id}
                  onRestore={() => restore(row._id)}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <EyeOff className="size-5 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">{t("hiddenEmpty")}</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function HiddenRow({
  conversation,
  pending,
  onRestore,
}: {
  conversation: RawConversationListItem;
  pending: boolean;
  onRestore: () => void;
}) {
  const t = useTranslations("Messages");
  const peer = conversation.userData;

  return (
    <li className="flex items-center gap-2 rounded-lg px-1 py-2">
      {conversation.type === "one-two-one" ? (
        <Avatar size="lg" className="shrink-0">
          <AvatarImage src={peer?.profile_image} alt={peer?.name ?? ""} />
          <AvatarFallback>{getInitials(peer?.name ?? "")}</AvatarFallback>
        </Avatar>
      ) : (
        <GroupAvatarStack members={conversation.members} />
      )}

      <span className="min-w-0 flex-1 truncate text-sm">
        {getConversationTitle(
          conversation,
          conversation.type === "bond-link-group" ? t("bondRoomFallback") : undefined,
        )}
      </span>

      <Button
        variant="outline"
        size="default"
        disabled={pending}
        onClick={onRestore}
      >
        <ArchiveRestore aria-hidden />
        {t("unhide")}
      </Button>
    </li>
  );
}
