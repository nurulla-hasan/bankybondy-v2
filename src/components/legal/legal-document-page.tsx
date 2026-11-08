import { getTranslations } from "next-intl/server";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { getLegalDocument, type LegalDocumentKind } from "@/lib/legal-content";

import { LegalContent } from "./legal-content";

export async function LegalDocumentPage({ kind }: { kind: LegalDocumentKind }) {
  const t = await getTranslations("Legal");
  const html = await getLegalDocument(kind);

  return (
    <PageWrapper className="space-y-6">
      <SectionHeading
        as="h1"
        alignment="left"
        variant="plain"
        constrain={false}
        title={t(`pages.${kind}.title`)}
      />
      <div className="max-w-3xl">
        <LegalContent
          html={html}
          emptyTitle={t(`pages.${kind}.emptyTitle`)}
          emptyDescription={t(`pages.${kind}.emptyDescription`)}
        />
      </div>
    </PageWrapper>
  );
}
