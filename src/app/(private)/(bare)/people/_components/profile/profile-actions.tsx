"use client";

import { useState } from "react";
import { ShieldBan, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { useBlockUser, useSendFriendRequest } from "@/services";
import type { RawPersonProfile } from "@/types";

import { ReportUserDialog } from "./report-user-dialog";

export function ProfileActions({ profile }: { profile: RawPersonProfile }) {
  const t = useTranslations("People");
  const router = useRouter();
  const sendRequest = useSendFriendRequest();
  const block = useBlockUser();
  const [blockOpen, setBlockOpen] = useState(false);

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
