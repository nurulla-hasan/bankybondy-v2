"use client";

import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MyProfile } from "@/types";

export function AboutCard({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{t("detail.about")}</CardTitle>
      </CardHeader>

      <CardContent>
        {profile.bio ? (
          <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
            {profile.bio}
          </p>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground italic">
            {t("detail.aboutEmpty")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
