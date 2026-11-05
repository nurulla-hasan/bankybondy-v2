"use client";

import { KeyRound, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChangePasswordDialog } from "../dialogs/change-password-dialog";
import { DeleteAccountDialog } from "../dialogs/delete-account-dialog";

function SecurityRow({
  icon,
  title,
  description,
  action,
  tone = "default",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={
            tone === "danger"
              ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
              : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          }
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}

export function SecurityCard() {
  const t = useTranslations("Profile");

  return (
    <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-base font-semibold">{t("security.title")}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {t("security.description")}
      </p>

      <div className="mt-2 divide-y divide-border/70">
        <SecurityRow
          icon={<KeyRound className="size-4" aria-hidden />}
          title={t("security.passwordTitle")}
          description={t("security.passwordDescription")}
          action={<ChangePasswordDialog />}
        />

        <SecurityRow
          tone="danger"
          icon={<TriangleAlert className="size-4" aria-hidden />}
          title={t("security.dangerTitle")}
          description={t("security.dangerDescription")}
          action={<DeleteAccountDialog />}
        />
      </div>
    </section>
  );
}
