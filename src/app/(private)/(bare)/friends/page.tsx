import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { FriendsTabs } from "@/app/(private)/(bare)/friends/_components/friends-tabs";

export default function FriendsPage() {
  const t = useTranslations("Friends");

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

      <Suspense fallback={null}>
        <FriendsTabs />
      </Suspense>
    </PageWrapper>
  );
}
