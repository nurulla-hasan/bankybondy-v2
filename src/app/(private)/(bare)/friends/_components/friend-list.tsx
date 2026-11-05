"use client";

import Link from "next/link";
import { Inbox, Send, Users, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { useFriendList } from "@/services";
import { cn, getInitials } from "@/lib/utils";
import type {
  FriendListKind,
  RawFriendPerson,
  RawFriendRequestItem,
} from "@/types";

// Each list returns its person under a different key (friendRequest.service.ts:211-430).
const PERSON_KEY = {
  requests: "followerInfo",
  sent: "followingInfo",
  friends: "friendInfo",
} as const;

const EMPTY_ICON = {
  requests: <Inbox className="size-5" aria-hidden />,
  sent: <Send className="size-5" aria-hidden />,
  friends: <Users className="size-5" aria-hidden />,
} as const;

type Row = { item: RawFriendRequestItem; person: RawFriendPerson };

function toRows(
  kind: FriendListKind,
  items: RawFriendRequestItem[],
): Row[] {
  return items.flatMap((item) => {
    const person = item[PERSON_KEY[kind]];
    return person ? [{ item, person }] : [];
  });
}

function FriendRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function FriendList({
  kind,
  page,
  onPageChange,
}: {
  kind: FriendListKind;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Friends");
  const { data, isPending, isError, isFetching } = useFriendList(kind, { page });
  const rows = toRows(kind, data?.result ?? []);

  return (
    <TabsContent value={kind} className="space-y-4">
      <h2 className="sr-only">{t(`tabs.${kind}`)}</h2>

      {isPending ? (
        <div className="grid gap-3 md:grid-cols-2" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <FriendRowSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("loadErrorTitle")}
          description={t("loadErrorDescription")}
        />
      ) : rows.length ? (
        <div
          className={cn(
            "grid gap-3 md:grid-cols-2",
            isFetching && "opacity-60 transition-opacity",
          )}
          aria-busy={isFetching}
        >
          {rows.map(({ item, person }) => (
            <div
              key={item._id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <Link
                href={`/people/${person._id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Avatar size="sm">
                  <AvatarImage src={person.profile_image} alt={person.name} />
                  <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate text-sm font-medium">
                  {person.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={EMPTY_ICON[kind]}
          title={t(`empty.${kind}Title`)}
          description={t(`empty.${kind}Description`)}
        />
      )}

      {data && !isError ? (
        <CustomPagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          updatePage={onPageChange}
        />
      ) : null}
    </TabsContent>
  );
}
