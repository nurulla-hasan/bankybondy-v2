"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Film, Images, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import {
  useChatGroup,
  useConversationMedia,
} from "@/services/hooks/chat.hook";
import type {
  MediaKind,
  RawChatPerson,
  RawConversationListItem,
} from "@/types";

import { ImageLightbox } from "./image-lightbox";

interface ChatInfoSheetProps {
  conversation: RawConversationListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isGroup = (conversation: RawConversationListItem) =>
  conversation.type !== "one-two-one";

export function ChatInfoSheet({
  conversation,
  open,
  onOpenChange,
}: ChatInfoSheetProps) {
  const t = useTranslations("Messages");
  const groupId = conversation.chatGroup?._id ?? null;
  const media = useConversationMedia(conversation._id, open);
  const groupQuery = useChatGroup(open ? groupId : null);
  const group = groupQuery.data;
  const [lightbox, setLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  // The sheet's focus trap fights a second dialog, so the preview takes over
  // and the sheet comes back when the preview closes (v1 opened its preview
  // over the media panel the same way).
  const openLightbox = (urls: string[], index: number) => {
    onOpenChange(false);
    setLightbox({ urls, index });
  };

  const closeLightbox = () => {
    setLightbox(null);
    onOpenChange(true);
  };

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

    if (kind === "pdf") {
      return (
        <>
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={`${item.messageId}-${item.url}`}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {fileName(item.url) ?? t("attachmentPdf", { count: 1 })}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <MediaLoadMore
            visible={hasMore}
            loading={loadingMore}
            label={t("mediaLoadMore")}
            onLoad={() => void media.fetchNextPage()}
          />
        </>
      );
    }

    return (
      <>
        <ul className="grid grid-cols-3 gap-1">
          {filtered.map((item, index) =>
            item.kind === "video" ? (
              <li key={`${item.messageId}-${item.url}`}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block aspect-square w-full overflow-hidden rounded-md bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="grid h-full w-full place-items-center">
                    <Film className="size-5 text-muted-foreground" aria-hidden />
                  </span>
                </a>
              </li>
            ) : (
              <li key={`${item.messageId}-${item.url}`}>
                <button
                  type="button"
                  onClick={() =>
                    openLightbox(
                      filtered.map((entry) => entry.url),
                      index,
                    )
                  }
                  className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-md bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Image
                    src={item.url}
                    alt=""
                    width={160}
                    height={160}
                    unoptimized
                    className="size-full object-cover"
                  />
                </button>
              </li>
            ),
          )}
        </ul>
        <MediaLoadMore
          visible={hasMore}
          loading={loadingMore}
          label={t("mediaLoadMore")}
          onLoad={() => void media.fetchNextPage()}
        />
      </>
    );
  };

  return (
    <>
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

      <ImageLightbox
        images={lightbox?.urls ?? []}
        index={lightbox?.index ?? null}
        onClose={closeLightbox}
        label={t("attachmentImage", { count: lightbox?.urls.length ?? 1 })}
      />
    </>
  );
}

function MediaLoadMore({
  visible,
  loading,
  label,
  onLoad,
}: {
  visible: boolean;
  loading: boolean;
  label: string;
  onLoad: () => void;
}) {
  if (!visible) return null;

  return (
    <div className="flex justify-center pt-3">
      <Button variant="ghost" size="default" disabled={loading} onClick={onLoad}>
        {label}
      </Button>
    </div>
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
  const { user } = useAuth();

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
      {people.map((member) => {
        const isSelf = member._id === user?._id;
        const row = (
          <>
            <Avatar size="sm">
              <AvatarImage src={member.profile_image} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-sm">{member.name}</span>
          </>
        );

        return (
          <li key={member._id} className="flex items-center gap-2">
            {isSelf ? (
              <div className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1.5">
                {row}
              </div>
            ) : (
              <Link
                href={`/people/${member._id}`}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 transition-colors hover:bg-muted"
              >
                {row}
              </Link>
            )}
            {creatorId === member._id ? (
              <Badge variant="secondary" size="sm">
                {t("creatorBadge")}
              </Badge>
            ) : null}
          </li>
        );
      })}
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
