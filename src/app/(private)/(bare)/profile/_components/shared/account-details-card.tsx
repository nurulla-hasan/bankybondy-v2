"use client";

import type { ReactNode } from "react";
import { CalendarDays, Mail, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { MyProfile } from "@/types";

function DetailRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <dt className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="truncate text-sm text-foreground">
          {value || <span className="text-muted-foreground">—</span>}
        </dd>
        {hint ? (
          <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function AccountDetailsCard({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");

  const rows = [
    {
      icon: <Mail className="size-4" aria-hidden />,
      label: t("detail.email"),
      value: profile.email,
      hint: t("emailLocked"),
    },
    {
      icon: <Phone className="size-4" aria-hidden />,
      label: t("detail.phone"),
      value: profile.phone,
    },
    {
      icon: <User className="size-4" aria-hidden />,
      label: t("detail.gender"),
      value: profile.gender ? t(`detail.gender_${profile.gender}`) : undefined,
    },
    {
      icon: <CalendarDays className="size-4" aria-hidden />,
      label: t("detail.birthdate"),
      value: profile.dateOfBirth
        ? formatDate(profile.dateOfBirth, "dd MMM yyyy")
        : undefined,
    },
    {
      icon: <MapPin className="size-4" aria-hidden />,
      label: t("detail.location"),
      value: profile.address,
    },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{t("detail.contactTitle")}</CardTitle>
      </CardHeader>

      <CardContent>
        <dl className="divide-y divide-border/70">
          {rows.map((row) => (
            <DetailRow key={row.label} {...row} />
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
