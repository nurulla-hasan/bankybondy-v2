"use client";

import Image from "next/image";
import { FileText, Film, Images, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  useChatGroup,
  useConversationMedia,
} from "@/services/hooks/chat.hook";
import type {
  ConversationMediaItem,
  MediaKind,
  RawChatPerson,
  RawConversationListItem,
} from "@/types";

interface ChatInfoSheetProps {
  conversation: RawConversationListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tapping an attachment closes the sheet and reveals the message it came from. */
  onOpenMedia: (item: ConversationMediaItem) => void;
}

const isGroup = (conversation: RawConversationListItem) =>
  conversation.type !== "one-two-one";

export function ChatInfoSheet({
  conversation,
  open,
  onOpenChange,
  onOpenMedia,
}: ChatInfoSheetProps) {
  const t = useTranslations("Messages");
  const groupId = conversation.chatGroup?._id ?? null;
  const media = useConversationMedia(conversation._id, open);
  const groupQuery = useChatGroup(open ? groupId : null);
  const group = groupQuery.data;

  const items = media.data?.items ?? [];
  const hasMore = Boolean(media.hasNextPage);
  const loadingMore = media.isFetchingNextPage;

  const mediaTab = (kind: MediaKind) => {
    const filtered = items.filter((item) => item.kind === kind);

    if (media.isPending) {
      return <MediaSkeleton />;
    }

    if (!filtered.length) {
      return <MediaEmpty label={t("mediaEmpty")} />;
    }

    return (
      <>
        {kind === "pdf" ? (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={`${item.messageId}-${item.url}`}>
                <button
                  type="button"
                  onClick={() => onOpenMedia(item)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {fileName(item.url) ?? t("attachmentPdf", { count: 1 })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-3 gap-1">
            {filtered.map((item) => (
              <li key={`${item.messageId}-${item.url}`}>
                <button
                  type="button"
                  onClick={() => onOpenMedia(item)}
                  className="relative block aspect-square w-full overflow-hidden rounded-md bg-muted cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {item.kind === "video" ? (
                    <span className="grid h-full w-full place-items-center">
                      <Film className="size-5 text-muted-foreground" aria-hidden />
                    </span>
                  ) : (
                    <Image
                      src={item.url}
                      alt=""
                      width={160}
                      height={160}
                      unoptimized
                      className="size-full object-cover"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasMore ? (
          <div className="flex justify-center pt-3">
            <Button
              variant="ghost"
              size="default"
              disabled={loadingMore}
              onClick={() => void media.fetchNextPage()}
            >
              {t("mediaLoadMore")}
            </Button>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("infoTitle")}</SheetTitle>
          <SheetDescription className="sr-only">{t("infoTitle")}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
          <MediaSection
            label={t("mediaTabImages")}
            itemCount={items.filter((item) => item.kind === "image").length}
          >
            {mediaTab("image")}
          </MediaSection>
          <MediaSection
            label={t("mediaTabVideos")}
            itemCount={items.filter((item) => item.kind === "video").length}
          >
            {mediaTab("video")}
          </MediaSection>
          <MediaSection
            label={t("mediaTabFiles")}
            itemCount={items.filter((item) => item.kind === "pdf").length}
          >
            {mediaTab("pdf")}
          </MediaSection>

          {isGroup(conversation) ? (
            <section className="mt-4 rounded-xl border border-border p-3">
              <header className="mb-2 flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 font-heading text-sm font-medium">
                  <Users className="size-4 text-muted-foreground" aria-hidden />
                  {t("membersTitle")}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {t("membersCountLabel", { count: membersCount(conversation, group?.participants) })}
                </span>
              </header>

              <MemberList
                conversation={conversation}
                participants={group?.participants}
                creatorId={group?.creator?._id}
                creatorName={group?.creator?.name}
                loading={Boolean(groupId) && groupQuery.isPending}
              />
            </section>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MediaSection({
  label,
  itemCount,
  children,
}: {
  label: string;
  itemCount: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 first:mt-0">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 font-heading text-sm font-medium">
          <Images className="size-4 text-muted-foreground" aria-hidden />
          {label}
        </h4>
        <span className="text-xs text-muted-foreground">{itemCount}</span>
      </header>
      {children}
    </section>
  );
}

function MemberList({
  conversation,
  participants,
  creatorId,
  creatorName,
  loading,
}: {
  conversation: RawConversationListItem;
  participants?: RawChatPerson[];
  creatorId?: string;
  creatorName?: string;
  loading: boolean;
}) {
  const t = useTranslations("Messages");

  if (loading) {
    return <p className="py-4 text-center text-xs text-muted-foreground">…</p>;
  }

  // The creator comes separately from `participants` and must be listed once.
  const people: RawChatPerson[] =
    participants && creatorId && !participants.some((p) => p._id === creatorId)
      ? [{ _id: creatorId, name: creatorName ?? "" }, ...participants]
      : (participants ?? conversation.members);

  return (
    <ul className="flex flex-col gap-1">
      {people.map((member) => (
        <li key={member._id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
          <Avatar size="sm">
            <AvatarImage src={member.profile_image} alt={member.name} />
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm">{member.name}</span>
          {creatorId === member._id ? (
            <Badge variant="secondary" size="sm">
              {t("creatorBadge")}
            </Badge>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function MediaSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="aspect-square animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

function MediaEmpty({ label }: { label: string }) {
  return <p className="py-4 text-center text-xs text-muted-foreground">{label}</p>;
}

function membersCount(
  conversation: RawConversationListItem,
  participants?: { _id: string }[],
): number {
  if (participants?.length) {
    // The group's creator is listed separately from `participants`.
    return participants.length + 1;
  }
  return conversation.members.length;
}

function fileName(url: string): string | null {
  const last = url.split("?")[0].split("/").pop() ?? "";
  if (!last.includes(".")) return null;

  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}
