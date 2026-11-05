"use client";

import type { ReactNode } from "react";
import { KeyRound, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordDialog } from "../dialogs/change-password-dialog";
import { DeleteAccountDialog } from "../dialogs/delete-account-dialog";

function SecurityRow({
  icon,
  title,
  description,
  action,
  tone = "default",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
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
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
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
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{t("security.title")}</CardTitle>
        <CardDescription>{t("security.description")}</CardDescription>
      </CardHeader>

      <CardContent className="divide-y divide-border/70">
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
      </CardContent>
    </Card>
  );
}
