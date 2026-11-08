import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ConsumerRequestForm } from "@/components/legal/consumer-request-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return {
    title: t("consumidor.tituloArrepentimiento"),
    description: t("consumidor.introArrepentimiento"),
  };
}

export default function ArrepentimientoPage() {
  return <ConsumerRequestForm tipo="arrepentimiento" />;
}
