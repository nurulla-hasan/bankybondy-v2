import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { MySettings } from "@/app/(private)/(bare)/settings/_components/my-settings";

export default function SettingsPage() {
  const t = useTranslations("Profile");

  return (
    <PageWrapper className="space-y-6">
      <SectionHeading
        as="h3"
        alignment="left"
        constrain={false}
        title={t("settings.title")}
        description={t("settings.subtitle")}
        descriptionClassName="max-w-2xl"
      >
        <Button variant="outline" render={<Link href="/profile" />}>
          <ArrowLeft className="size-4" aria-hidden />
          {t("settings.backToProfile")}
        </Button>
      </SectionHeading>

      <Suspense fallback={null}>
        <MySettings />
      </Suspense>
    </PageWrapper>
  );
}
