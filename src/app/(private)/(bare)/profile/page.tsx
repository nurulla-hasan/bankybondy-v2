import { Suspense } from "react";
// import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
// import { SectionHeading } from "@/components/common/section-heading";
import { MyProfileView } from "@/app/(private)/(bare)/profile/_components/my-profile";

export default function ProfilePage() {
  // const t = useTranslations("Profile");

  return (
    <PageWrapper className="space-y-6">
      {/* <SectionHeading
        as="h3"
        alignment="left"
        constrain={false}
        title={t("title")}
        description={t("subtitle")}
        descriptionClassName="max-w-2xl"
      /> */}

      <Suspense fallback={null}>
        <MyProfileView />
      </Suspense>
    </PageWrapper>
  );
}
