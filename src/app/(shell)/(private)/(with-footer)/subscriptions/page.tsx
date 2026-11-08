import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { WithdrawalNotice } from "@/components/legal/withdrawal-notice";

import { SubscriptionContent } from "./_components/subscription-content";

export default function SubscriptionsPage() {
  const t = useTranslations("Subscription");

  return (
    <PageWrapper className="space-y-6">
      <SectionHeading
        as="h3"
        alignment="left"
        constrain={false}
        title={t("title")}
        description={t("subtitle")}
        descriptionClassName="max-w-2xl"
      />
      <WithdrawalNotice />
      <SubscriptionContent />
    </PageWrapper>
  );
}
