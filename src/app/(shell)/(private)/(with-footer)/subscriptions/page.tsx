import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";

import { SubscriptionCheckout } from "./_components/subscription-checkout";

export default function SubscriptionsPage() {
  const t = useTranslations("Subscription");

  return (
    <PageWrapper className="space-y-8">
      <SectionHeading
        as="h3"
        alignment="left"
        constrain={false}
        title={t("title")}
        description={t("description")}
      />
      <SubscriptionCheckout />
    </PageWrapper>
  );
}
