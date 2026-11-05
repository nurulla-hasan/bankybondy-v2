"use client";

import type { ReactNode } from "react";
import { CalendarDays, ExternalLink, Globe, Mail, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import type { MyProfile } from "@/types";

function linkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

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
    <div className="flex items-start gap-3 py-3">
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

export function OverviewTab({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");

  const details = [
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

  const skills = (profile.skills ?? []).map((skill) => skill.name);

  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-base font-semibold">
              {t("detail.contactTitle")}
            </h2>
            <dl className="mt-1 divide-y divide-border/70">
              {details.map((row) => (
                <DetailRow key={row.label} {...row} />
              ))}
            </dl>
          </section>

          {profile.socialLinks?.length ? (
            <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <h2 className="font-heading text-base font-semibold">
                {t("detail.links")}
              </h2>
              <ul className="mt-3 space-y-2">
                {profile.socialLinks.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5 text-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="truncate">{linkLabel(url)}</span>
                      </span>
                      <ExternalLink
                        className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-base font-semibold">
              {t("detail.about")}
            </h2>
            {profile.bio ? (
              <p className="mt-3 text-sm leading-7 text-muted-foreground whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground italic">
                {t("detail.aboutEmpty")}
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="font-heading text-base font-semibold">
              {t("detail.skills")}
            </h2>
            {skills.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground italic">
                {t("detail.skillsEmpty")}
              </p>
            )}
          </section>
        </div>
      </div>
    </TabsContent>
  );
}
