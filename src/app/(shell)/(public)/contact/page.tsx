import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, Phone, ShieldCheck } from "lucide-react";

import AnimationWrapper from "@/components/common/animation-wrapper";
import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/components/legal/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { breadcrumbSchema, buildMetadata, contactPageSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "bankybondyar@gmail.com";
const SUPPORT_PHONE = "+54 9 2262 615847";
const SUPPORT_PHONE_HREF = "+5492262615847";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Legal"),
  ]);

  return buildMetadata({
    title: t("contact.title"),
    description: t("contact.description"),
    path: "/contact",
    locale,
  });
}

interface SupportRowProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}

function SupportRow({ icon, title, children, className }: SupportRowProps) {
  return (
    <div className={cn("flex items-start gap-3.5", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Legal"),
  ]);
  const title = t("contact.title");
  const description = t("contact.description");

  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-75 bg-linear-to-b from-primary/5 to-transparent"
      />

      <PageWrapper padding="spacious" className="relative z-10 space-y-10">
        <JsonLd
          data={contactPageSchema({
            title,
            description,
            path: "/contact",
            locale,
          })}
        />
        <JsonLd
          data={breadcrumbSchema([
            { name: t("breadcrumbHome"), path: "/" },
            { name: title, path: "/contact" },
          ])}
        />
        <AnimationWrapper direction="up" once>
          <SectionHeading
            eyebrow={t("contact.eyebrow")}
            as="h1"
            title={t("contact.title")}
            description={t("contact.description")}
            descriptionClassName="mt-3"
          />
        </AnimationWrapper>

        <div className="grid gap-6 lg:grid-cols-5 lg:items-start lg:gap-8">
          <AnimationWrapper
            direction="up"
            delay={0.05}
            once
            className="space-y-4 lg:col-span-2"
          >
            <Card>
              <CardContent className="space-y-4">
                <SupportRow
                  icon={<Mail className="size-5" aria-hidden />}
                  title={t("contact.emailTitle")}
                >
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="block text-sm break-all text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </SupportRow>

                <div aria-hidden className="border-t border-border/60" />

                <SupportRow
                  icon={<Phone className="size-5" aria-hidden />}
                  title={t("contact.phoneTitle")}
                >
                  <a
                    href={`tel:${SUPPORT_PHONE_HREF}`}
                    className="block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {SUPPORT_PHONE}
                  </a>
                </SupportRow>

                <div aria-hidden className="border-t border-border/60" />

                <SupportRow
                  icon={<Clock className="size-5" aria-hidden />}
                  title={t("contact.hoursTitle")}
                >
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("contact.hours")}
                  </p>
                </SupportRow>
              </CardContent>
            </Card>

            <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 p-4 text-xs leading-5 text-muted-foreground ring-1 ring-primary/10">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{t("contact.responseTime")}</p>
            </div>
          </AnimationWrapper>

          <AnimationWrapper
            direction="up"
            delay={0.1}
            once
            className="lg:col-span-3"
          >
            <ContactForm />
          </AnimationWrapper>
        </div>

        <AnimationWrapper direction="up" delay={0.05} once>
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl bg-muted/50 p-4 text-xs leading-6 text-muted-foreground ring-1 ring-border/70">
            <ShieldCheck
              className="mt-1 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <p>{t("consumidor.atencion")}</p>
          </div>
        </AnimationWrapper>
      </PageWrapper>
    </div>
  );
}
