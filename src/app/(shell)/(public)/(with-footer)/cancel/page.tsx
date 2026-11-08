import Link from "next/link";
import { XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { ConsumerLinks } from "@/components/legal/consumer-links";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  const t = useTranslations("PaymentResult");

  return (
    <PageWrapper className="flex flex-col items-center justify-center text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <XCircle className="size-8" aria-hidden />
      </span>

      <SectionHeading
        as="h3"
        alignment="center"
        variant="plain"
        className="mt-4"
        title={t("cancel.title")}
        description={t("cancel.description")}
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/subscriptions" />}>
          {t("cancel.ctaSubscriptions")}
        </Button>
        <Button variant="outline" render={<Link href="/" />}>
          {t("cancel.ctaHome")}
        </Button>
      </div>

      <ConsumerLinks className="mt-6" />
    </PageWrapper>
  );
}
