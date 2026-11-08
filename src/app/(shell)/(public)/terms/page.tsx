import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return {
    title: t("pages.terms.metaTitle"),
    description: t("pages.terms.metaDescription"),
  };
}

export default function TermsPage() {
  return <LegalDocumentPage kind="terms" />;
}
