"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MyProfile } from "@/types";

export function SkillsCard({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");
  const skills = (profile.skills ?? []).map((skill) => skill.name);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{t("detail.skills")}</CardTitle>
      </CardHeader>

      <CardContent>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground italic">
            {t("detail.skillsEmpty")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
