"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bookmark, BookmarkX, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteCardSkeleton } from "../cards/favorite-card-skeleton";
import {
  useBookmarkedAudios,
  useToggleAudioBookmark,
} from "@/services/hooks/audio.hook";
import type { RawBookmarkedAudio } from "@/types";

import { compactNumber, formatClock } from "../shared/format";

interface FavoritesProps {
  embedded?: boolean;
}

export function Favorites({ embedded = false }: FavoritesProps) {
  const t = useTranslations("Chatting");
  const bookmarksQuery = useBookmarkedAudios();
  const toggleSave = useToggleAudioBookmark();

  const bookmarks = bookmarksQuery.data ?? [];

  return (
    <div className="w-full space-y-6">
      {!embedded ? (
        <header>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("favoritesTitle")}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {t("favoritesSubtitle")}
          </p>
        </header>
      ) : null}

      {bookmarksQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <FavoriteCardSkeleton key={index} />
          ))}
        </div>
      ) : bookmarksQuery.isError ? (
        <EmptyState
          icon={<Headphones className="size-5" aria-hidden />}
          title={t("loadErrorTitle")}
          description={t("loadErrorDescription")}
          action={
            <Button
              variant="outline"
              onClick={() => void bookmarksQuery.refetch()}
            >
              {t("loadErrorAction")}
            </Button>
          }
        />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="size-5" aria-hidden />}
          title={t("favoritesEmptyTitle")}
          description={t("favoritesEmptyDescription")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <FavoriteCard
              key={bookmark._id}
              audio={bookmark.audio}
              onRemove={() => toggleSave.mutate(bookmark.audio._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteCard({
  audio,
  onRemove,
}: {
  audio: RawBookmarkedAudio;
  onRemove: () => void;
}) {
  const t = useTranslations("Chatting");
  const average = audio.ratingCount
    ? (audio.totalRating / audio.ratingCount).toFixed(1)
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
      <Link
        href={`/chatting/conversations/${audio._id}`}
        aria-label={t("cardOpenLabel", { title: audio.title })}
        className="relative block aspect-video overflow-hidden bg-linear-to-br from-primary/25 via-tone-violet/15 to-transparent"
      >
        {audio.cover_image ? (
          <Image
            src={audio.cover_image}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {audio.audioTopic ? (
            <Badge variant="secondary">{audio.audioTopic.name}</Badge>
          ) : null}
          <Badge variant="secondary">{formatClock(audio.duration)}</Badge>
        </div>

        <span className="absolute right-3 bottom-3 inline-flex items-center rounded-full bg-background/90 p-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={`/chatting/conversations/${audio._id}`}
          className="line-clamp-2 font-heading text-sm font-medium transition-colors hover:text-primary sm:text-base"
        >
          {audio.title}
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Headphones className="size-3.5" aria-hidden />
            {compactNumber(audio.totalPlay)}
          </span>
          {average ? (
            <span className="tabular-nums">★ {average}</span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <Button variant="outline" render={<Link href={`/chatting/conversations/${audio._id}`} />}>
            {t("favoritesOpen")}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("favoritesRemove")}
            onClick={onRemove}
          >
            <BookmarkX aria-hidden className="text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  );
}
