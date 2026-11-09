"use client";

import { useState } from "react";
import { Handshake, ShieldBan, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { Button } from "@/components/ui/button";
import { getErrorMessage, isBondLimitReachedError } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import {
  useBlockUser,
  useCreateBondRequest,
  useSendFriendRequest,
} from "@/services";
import type { RawPersonProfile, RawPublicBond } from "@/types";

import { ReportUserDialog } from "./report-user-dialog";

interface ProfileActionsProps {
  profile: RawPersonProfile;
  selectedBond: RawPublicBond | null;
  onProposed?: () => void;
}

export function ProfileActions({
  profile,
  selectedBond,
  onProposed,
}: ProfileActionsProps) {
  const t = useTranslations("People");
  const tBonds = useTranslations("Bonds");
  const router = useRouter();
  const sendRequest = useSendFriendRequest();
  const block = useBlockUser();
  const createRequest = useCreateBondRequest();
  const [blockOpen, setBlockOpen] = useState(false);

  const canPropose = selectedBond?.status === "WAITING_FOR_LINK";

  const handleConnect = () => {
    sendRequest.mutate(
      { receiver: profile._id },
      {
        onSuccess: () =>
          successToast(
            t("actions.connectSuccessTitle"),
            t("actions.connectSuccess", { name: profile.name }),
          ),
        onError: (error) =>
          errorToast(t("actions.connectErrorTitle"), getErrorMessage(error)),
      },
    );
  };

  const handlePropose = () => {
    if (!selectedBond || !canPropose) return;

    const modality =
      selectedBond.modality?.toLowerCase() === "online" ? "online" : "physical";
    const description = selectedBond.description?.trim();

    // Mirrored bond: what they offer becomes what I want.
    createRequest.mutate(
      {
        offer: selectedBond.want,
        want: selectedBond.offer,
        description:
          description && description.length >= 10
            ? description
            : t("actions.proposeDescription", {
                offer: selectedBond.want,
                want: selectedBond.offer,
              }),
        modality,
        radiusKm: selectedBond.radius ?? 20,
      },
      {
        onSuccess: (response) => {
          successToast(
            t("actions.proposeSuccessTitle"),
            t("actions.proposeSuccess", { name: profile.name }),
          );
          onProposed?.();
          router.push(`/bonds?tab=matches&request=${response.data._id}`);
        },
        onError: (error) => {
          if (isBondLimitReachedError(error)) {
            // Same upgrade path as the create dialog: keep the reader here and
            // offer the plans instead of a generic failure.
            errorToast(
              tBonds("limitReachedTitle"),
              tBonds("limitReachedDescription"),
              {
                action: {
                  label: tBonds("viewPlans"),
                  onClick: () => router.push("/subscriptions"),
                },
              },
            );
            return;
          }
          errorToast(t("actions.proposeErrorTitle"), getErrorMessage(error));
        },
      },
    );
  };

  const handleBlock = () => {
    block.mutate(profile._id, {
      onSuccess: () => {
        successToast(
          t("actions.blockSuccessTitle"),
          t("actions.blockSuccess", { name: profile.name }),
        );
        setBlockOpen(false);
        router.push("/people");
      },
      onError: (error) => {
        errorToast(t("actions.blockErrorTitle"), getErrorMessage(error));
        setBlockOpen(false);
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={handlePropose}
        disabled={!canPropose}
        loading={createRequest.isPending}
        loadingText={t("actions.proposing")}
      >
        <Handshake className="size-4" aria-hidden />
        {t("actions.propose")}
      </Button>

      {profile.friendRequestStatus === "none" ? (
        <Button
          onClick={handleConnect}
          loading={sendRequest.isPending}
          loadingText={t("actions.connecting")}
        >
          <UserPlus className="size-4" aria-hidden />
          {t("actions.connect")}
        </Button>
      ) : null}

      <Button variant="outline" onClick={() => setBlockOpen(true)}>
        <ShieldBan className="size-4" aria-hidden />
        {t("actions.block")}
      </Button>

      <ReportUserDialog profileId={profile._id} name={profile.name} />

      <ConfirmationModal
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title={t("actions.blockTitle", { name: profile.name })}
        description={t("actions.blockDescription")}
        confirmText={t("actions.blockConfirm")}
        loadingText={t("actions.blockConfirm")}
        cancelText={t("actions.blockCancel")}
        variant="destructive"
        isLoading={block.isPending}
        onConfirm={handleBlock}
      />
    </div>
  );
}
