import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return {
    title: t("pages.about.metaTitle"),
    description: t("pages.about.metaDescription"),
  };
}

export default function AboutPage() {
  return <LegalDocumentPage kind="about" />;
}
