"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import {
  BondTabs,
  type BondTab,
} from "@/app/(private)/(bare)/bonds/_components/tabs/bond-tabs";
import { CreateBondDialog } from "@/app/(private)/(bare)/bonds/_components/dialogs/create-bond-dialog";
import { useNextFilter } from "@/hooks/useNextFilter";
import type { BondRequest } from "@/types";

type BondFilterKey = "tab" | "request";

const BOND_TABS: readonly BondTab[] = ["requests", "matches", "links"];
const DEFAULT_TAB: BondTab = "requests";

function BondsContent() {
  const t = useTranslations("Bonds");
  const { getFilter, updateFilter, updateBatch } =
    useNextFilter<BondFilterKey>();

  const tabValue = getFilter("tab", DEFAULT_TAB) as BondTab;
  const activeTab = BOND_TABS.includes(tabValue) ? tabValue : DEFAULT_TAB;
  const requestFilterId = getFilter("request") || null;

  const handleTabChange = (tab: BondTab) => {
    updateFilter("tab", tab === DEFAULT_TAB ? null : tab);
  };

  const handleFindMatch = (request: BondRequest) => {
    updateBatch({ tab: "matches", request: request.id });
  };

  return (
    <PageWrapper paddingSize="large" className="space-y-6">
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

      <BondTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        requestFilterId={requestFilterId}
        onClearFilter={() => updateFilter("request", null)}
        onFindMatch={handleFindMatch}
      />
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
