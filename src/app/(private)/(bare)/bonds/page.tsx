"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { BondTabs } from "@/app/(private)/(bare)/bonds/_components/tabs/bond-tabs";
import { CreateBondDialog } from "@/app/(private)/(bare)/bonds/_components/dialogs/create-bond-dialog";

function BondsContent() {
  const t = useTranslations("Bonds");

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
        <CreateBondDialog />
      </SectionHeading>

      <BondTabs />
    </PageWrapper>
  );
}

export default function BondsPage() {
  return (
    <Suspense fallback={null}>
      <BondsContent />
    </Suspense>
  );
}
