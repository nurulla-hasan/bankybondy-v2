"use client";

import { Check, UserMinus, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import {
  useCancelFriendRequest,
  useRespondFriendRequest,
  useUnfriend,
} from "@/services";
import type { FriendDecision, FriendListKind } from "@/types";

interface FriendActionsProps {
  kind: FriendListKind;
  /** FriendRequest id — required by accept/reject, nothing else. */
  requestId: string;
  /** The other person's profile id — required by cancel and unfriend. */
  personId: string;
  personName: string;
}

export function FriendActions({
  kind,
  requestId,
  personId,
  personName,
}: FriendActionsProps) {
  const t = useTranslations("Friends");
  const respond = useRespondFriendRequest();
  const withdraw = useCancelFriendRequest();
  const unfriend = useUnfriend();

  const handleRespond = (decision: FriendDecision) => {
    respond.mutate(
      { requestId, decision, personId },
      {
        onSuccess: () =>
          successToast(
            decision === "Accepted" ? t("acceptedTitle") : t("rejectedTitle"),
            t(decision === "Accepted" ? "accepted" : "rejected", {
              name: personName,
            }),
          ),
        onError: (error) =>
          errorToast(
            t("respondFailed"),
            getErrorMessage(error, t("respondFailed")),
          ),
      },
    );
  };

  const handleWithdraw = () => {
    withdraw.mutate(personId, {
      onSuccess: () =>
        successToast(t("withdrawnTitle"), t("withdrawn", { name: personName })),
      onError: (error) =>
        errorToast(
          t("withdrawFailed"),
          getErrorMessage(error, t("withdrawFailed")),
        ),
    });
  };

  // Returned to ConfirmationModal, which awaits it to drive its spinner.
  const handleUnfriend = async () => {
    try {
      await unfriend.mutateAsync(personId);
      successToast(t("unfriendedTitle"), t("unfriended", { name: personName }));
    } catch (error) {
      errorToast(
        t("unfriendFailed"),
        getErrorMessage(error, t("unfriendFailed")),
      );
    }
  };

  if (kind === "requests") {
    const busyFor = (decision: FriendDecision) =>
      respond.isPending &&
      respond.variables?.requestId === requestId &&
      respond.variables?.decision === decision;

    return (
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          onClick={() => handleRespond("Rejected")}
          disabled={respond.isPending}
          loading={busyFor("Rejected")}
          loadingText={t("reject")}
        >
          <X className="size-4" aria-hidden />
          {t("reject")}
        </Button>
        <Button
          onClick={() => handleRespond("Accepted")}
          disabled={respond.isPending}
          loading={busyFor("Accepted")}
          loadingText={t("accept")}
        >
          <Check className="size-4" aria-hidden />
          {t("accept")}
        </Button>
      </div>
    );
  }

  if (kind === "sent") {
    return (
      <Button
        variant="outline"
        onClick={handleWithdraw}
        disabled={withdraw.isPending}
        loading={withdraw.isPending && withdraw.variables === personId}
        loadingText={t("withdrawing")}
      >
        {t("withdrawing")}
      </Button>
    );
  }

  return (
    <ConfirmationModal
      title={t("unfriendTitle", { name: personName })}
      description={t("unfriendDescription")}
      confirmText={t("unfriend")}
      cancelText={t("cancel")}
      variant="destructive"
      onConfirm={handleUnfriend}
      actionTrigger={
        <Button
          variant="outline"
          disabled={unfriend.isPending}
          aria-label={t("unfriendTitle", { name: personName })}
        >
          <UserMinus className="size-4" aria-hidden />
          {t("unfriend")}
        </Button>
      }
    />
  );
}
