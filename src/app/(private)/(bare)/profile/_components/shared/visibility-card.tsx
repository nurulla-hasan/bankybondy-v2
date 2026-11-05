"use client";

import { useState } from "react";
import { EyeOff, Link2, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { successToast } from "@/lib/toast";
import { mockDelay } from "@/mocks/profile.mock";
import type { MyProfile } from "@/types";

type VisibilityKey = "listedInPeople" | "bondsPublic";

function ToggleRow({
  id,
  title,
  hint,
  checked,
  isSaving,
  onCheckedChange,
}: {
  id: string;
  title: string;
  hint: string;
  checked: boolean;
  isSaving: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 space-y-1">
        <label
          htmlFor={id}
          className="block cursor-pointer text-sm font-medium text-foreground"
        >
          {title}
        </label>
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isSaving ? (
          <Spinner className="size-4 text-muted-foreground" aria-hidden />
        ) : null}
        <Switch
          id={id}
          checked={checked}
          disabled={isSaving}
          onCheckedChange={onCheckedChange}
          aria-describedby={`${id}-hint`}
        />
      </div>
    </div>
  );
}

export function VisibilityCard({
  profile,
  onPatch,
}: {
  profile: MyProfile;
  onPatch: (patch: Partial<MyProfile>) => void;
}) {
  const t = useTranslations("Profile");
  const [saving, setSaving] = useState<VisibilityKey | null>(null);

  const handleToggle = async (key: VisibilityKey, next: boolean) => {
    setSaving(key);
    await mockDelay(next, 600);
    onPatch({ [key]: next });
    setSaving(null);
    successToast(t("visibility.savedTitle"), t(`visibility.${key}Saved`));
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex-row items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>{t("visibility.title")}</CardTitle>
          <CardDescription>{t("visibility.description")}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="divide-y divide-border/70">
          <ToggleRow
            id="listed-in-people"
            title={t("visibility.people")}
            hint={
              profile.listedInPeople
                ? t("visibility.peopleHint")
                : t("visibility.peopleHiddenHint")
            }
            checked={Boolean(profile.listedInPeople)}
            isSaving={saving === "listedInPeople"}
            onCheckedChange={(next) => handleToggle("listedInPeople", next)}
          />

          <ToggleRow
            id="bonds-public"
            title={t("visibility.bonds")}
            hint={
              profile.bondsPublic
                ? t("visibility.bondsHint")
                : t("visibility.bondsHiddenHint")
            }
            checked={Boolean(profile.bondsPublic)}
            isSaving={saving === "bondsPublic"}
            onCheckedChange={(next) => handleToggle("bondsPublic", next)}
          />
        </div>

        {!profile.listedInPeople || !profile.bondsPublic ? (
          <p className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
            {profile.listedInPeople ? (
              <Link2 className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <EyeOff className="size-3.5 shrink-0" aria-hidden />
            )}
            {t("visibility.hiddenNote")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
