import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return {
    title: t("pages.privacy.metaTitle"),
    description: t("pages.privacy.metaDescription"),
  };
}

export default function PrivacyPage() {
  return <LegalDocumentPage kind="privacy" />;
}
