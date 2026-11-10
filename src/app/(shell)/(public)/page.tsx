import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { CtaBand } from "@/components/home/cta-band";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { ValuesMarquee } from "@/components/home/values-marquee";
import { SITE_NAME, buildMetadata, getSiteDescription } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Hero" });

  return buildMetadata({
    title: `${SITE_NAME} — ${t("title")}`,
    absoluteTitle: true,
    description: getSiteDescription(locale),
    path: "/",
    locale,
    keywords: [
      "Bankybondy",
      "mutual help network",
      "red de ayuda mutua",
      "barter",
      "trueque",
      "skill exchange",
      "intercambio de habilidades",
      "comunidad",
    ],
  });
}

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <HowItWorks />
      <ValuesMarquee />
      <Features />
      <CtaBand />
    </div>
  );
}
