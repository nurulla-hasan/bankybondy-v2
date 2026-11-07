"use client";

import { useEffect } from "react";
import { Ban, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { cn, getInitials } from "@/lib/utils";
import { useBlockedUsers, useUnblockUser } from "@/services";
import type { RawBlockedUser } from "@/types";

type BlockedPerson = NonNullable<RawBlockedUser["blocked"]>;

export function BlockedList({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("People");
  const friendsT = useTranslations("Friends");
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useBlockedUsers({ page, limit: 12 });
  const unblock = useUnblockUser();
  const people = (data?.result ?? []).flatMap((row) =>
    row.blocked ? [row.blocked] : [],
  );

  useEffect(() => {
    if (!data || isFetching || isPlaceholderData || isError) return;
    const lastPage = Math.max(1, data.meta.totalPages);
    if (page > lastPage) onPageChange(lastPage);
  }, [data, isFetching, isPlaceholderData, isError, page, onPageChange]);

  const handleUnblock = (person: BlockedPerson) => {
    unblock.mutate(person._id, {
      onSuccess: () =>
        successToast(
          t("blocked.unblockedTitle"),
          t("blocked.unblocked", { name: person.name }),
        ),
      onError: (error) =>
        errorToast(
          t("blocked.unblockFailed"),
          getErrorMessage(error, t("blocked.unblockFailed")),
        ),
    });
  };

  return (
    <TabsContent value="blocked" className="space-y-4">
      <h2 className="sr-only">{friendsT("tabs.blocked")}</h2>
      {isPending ? (
        <div className="grid gap-3 md:grid-cols-2" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("blocked.loadErrorTitle")}
          description={t("blocked.loadErrorDescription")}
          action={<Button variant="outline" onClick={() => void refetch()}>{t("empty.retry")}</Button>}
        />
      ) : people.length ? (
        <div
          className={cn("grid gap-3 md:grid-cols-2", isFetching && "opacity-60 transition-opacity")}
          aria-busy={isFetching}
        >
          {people.map((person) => (
            <div key={person._id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <Avatar size="sm">
                <AvatarImage src={person.profile_image} alt={person.name} />
                <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{person.name}</span>
              <Button
                variant="outline"
                aria-label={`${t("blocked.unblock")} ${person.name}`}
                onClick={() => handleUnblock(person)}
                disabled={unblock.isPending || isPlaceholderData}
                loading={unblock.isPending && unblock.variables === person._id}
                loadingText={t("blocked.unblock")}
              >
                {t("blocked.unblock")}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Ban className="size-5" aria-hidden />}
          title={t("blocked.emptyTitle")}
          description={t("blocked.emptyDescription")}
        />
      )}

      {data && !isError && !isPlaceholderData ? (
        <CustomPagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          updatePage={onPageChange}
        />
      ) : null}
    </TabsContent>
  );
}
