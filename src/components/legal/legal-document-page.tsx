import { getTranslations } from "next-intl/server";

import { PageWrapper } from "@/components/common/page-wrapper";
import { getLegalDocument, type LegalDocumentKind } from "@/lib/legal-content";

import { LegalContent } from "./legal-content";

export async function LegalDocumentPage({ kind }: { kind: LegalDocumentKind }) {
  const t = await getTranslations("Legal");
  const html = await getLegalDocument(kind);

  return (
    <PageWrapper>
      <div>
        <LegalContent
          html={html}
          emptyTitle={t(`pages.${kind}.emptyTitle`)}
          emptyDescription={t(`pages.${kind}.emptyDescription`)}
        />
      </div>
    </PageWrapper>
  );
}
