"use client";

import { Ban, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Modal } from "@/components/common/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { cn, getInitials } from "@/lib/utils";
import { useBlockedUsers, useUnblockUser } from "@/services";
import type { RawBlockedUser } from "@/types";

/**
 * `blocked` comes back as `{ _id, name, profile_image }` and turns null when the
 * profile was deleted, which leaves no id to unblock — those rows are dropped.
 */
type BlockedPerson = NonNullable<RawBlockedUser["blocked"]>;

function BlockedUsersList() {
  const t = useTranslations("People");
  const { data, isPending, isError, isFetching, refetch } = useBlockedUsers();
  const unblock = useUnblockUser();

  const people: BlockedPerson[] = (data?.result ?? []).flatMap((row) =>
    row.blocked ? [row.blocked] : [],
  );

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

  if (isError) {
    return (
      <EmptyState
        icon={<WifiOff className="size-5" aria-hidden />}
        title={t("blocked.loadErrorTitle")}
        description={t("blocked.loadErrorDescription")}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            {t("empty.retry")}
          </Button>
        }
      />
    );
  }

  if (isPending) {
    return (
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (!people.length) {
    return (
      <EmptyState
        icon={<Ban className="size-5" aria-hidden />}
        title={t("blocked.emptyTitle")}
        description={t("blocked.emptyDescription")}
      />
    );
  }

  return (
    <div
      className={cn(
        "space-y-3",
        isFetching && "opacity-60 transition-opacity",
      )}
      aria-busy={isFetching}
    >
      {people.map((person) => (
        <div
          key={person._id}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
        >
          <Avatar size="sm">
            <AvatarImage src={person.profile_image} alt={person.name} />
            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
          </Avatar>

          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {person.name}
          </span>

          <Button
            variant="outline"
            onClick={() => handleUnblock(person)}
            disabled={unblock.isPending}
            loading={unblock.isPending && unblock.variables === person._id}
            loadingText={t("blocked.unblock")}
          >
            {t("blocked.unblock")}
          </Button>
        </div>
      ))}
    </div>
  );
}

export function BlockedUsersDialog() {
  const t = useTranslations("People");

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="size-4 text-muted-foreground" aria-hidden />
          {t("blocked.title")}
        </CardTitle>

        <CardDescription>{t("blocked.subtitle")}</CardDescription>

        <CardAction>
          <Modal
            title={t("blocked.title")}
            description={t("blocked.subtitle")}
            actionTrigger={
              <Button type="button" variant="outline">
                {t("blocked.manage")}
              </Button>
            }
          >
            <BlockedUsersList />
          </Modal>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
