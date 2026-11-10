import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, faqSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("DonateUs"),
  ]);

  return buildMetadata({
    title: t("pill"),
    description: t("heroSubtitle"),
    path: "/donate",
    locale,
  });
}

export default async function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("DonateUs");

  const faq = [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    { question: t("faq4Q"), answer: t("faq4A") },
  ];

  return (
    <>
      {children}
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
