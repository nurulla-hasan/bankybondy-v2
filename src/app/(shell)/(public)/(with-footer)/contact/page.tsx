import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { ContactForm } from "@/components/legal/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SUPPORT_EMAIL = "bankybondyar@gmail.com";
const SUPPORT_PHONE = "+54 9 2262 615847";
const SUPPORT_PHONE_HREF = "+5492262615847";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return {
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("Legal");

  return (
    <PageWrapper className="space-y-8">
      <SectionHeading
        as="h1"
        variant="plain"
        title={t("contact.title")}
        description={t("contact.description")}
        descriptionClassName="mt-3"
      />

      <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader className="items-center text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="size-5" aria-hidden />
              </span>
              <CardTitle>{t("contact.emailTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium break-all text-foreground underline-offset-4 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="items-center text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Phone className="size-5" aria-hidden />
              </span>
              <CardTitle>{t("contact.phoneTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <a
                href={`tel:${SUPPORT_PHONE_HREF}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {SUPPORT_PHONE}
              </a>
            </CardContent>
          </Card>

          <p className="text-center text-xs leading-6 text-muted-foreground">
            {t("contact.hours")}
          </p>
        </div>

        <ContactForm />
      </div>

      <p className="mx-auto max-w-2xl text-center text-xs leading-6 text-muted-foreground">
        {t("consumidor.atencion")}
      </p>
    </PageWrapper>
  );
}
