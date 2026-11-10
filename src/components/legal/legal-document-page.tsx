import { getTranslations } from "next-intl/server";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { getLegalDocument, type LegalDocumentKind } from "@/lib/legal-content";
import { breadcrumbSchema } from "@/lib/seo";

import { LegalContent } from "./legal-content";

const PAGE_PATHS: Record<LegalDocumentKind, string> = {
  about: "/about",
  terms: "/terms",
  privacy: "/privacy",
};

export async function LegalDocumentPage({ kind }: { kind: LegalDocumentKind }) {
  const t = await getTranslations("Legal");
  const html = await getLegalDocument(kind);
  const title = t(`pages.${kind}.title`);

  return (
    <PageWrapper className="space-y-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: t("breadcrumbHome"), path: "/" },
          { name: title, path: PAGE_PATHS[kind] },
        ])}
      />

      <SectionHeading
        as="h1"
        alignment="left"
        variant="plain"
        constrain={false}
        title={title}
      />

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
