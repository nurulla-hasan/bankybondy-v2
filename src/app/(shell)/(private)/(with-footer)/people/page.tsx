import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SearchInput } from "@/components/common/search-input";
import { SectionHeading } from "@/components/common/section-heading";
import { PeopleDirectory } from "@/app/(shell)/(private)/(with-footer)/people/_components/directory/people-directory";

export default function PeoplePage() {
  const t = useTranslations("People");

  return (
    <PageWrapper className="space-y-6">
      <SectionHeading
        as="h3"
        alignment="left"
        constrain={false}
        title={t("title")}
        description={t("subtitle")}
        descriptionClassName="max-w-2xl"
      >
        <Suspense fallback={null}>
          <SearchInput />
        </Suspense>
      </SectionHeading>

      <Suspense fallback={null}>
        <PeopleDirectory />
      </Suspense>
    </PageWrapper>
  );
}
