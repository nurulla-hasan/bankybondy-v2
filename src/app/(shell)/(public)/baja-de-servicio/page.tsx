import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ConsumerRequestForm } from "@/components/legal/consumer-request-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return {
    title: t("consumidor.tituloBaja"),
    description: t("consumidor.introBaja"),
  };
}

export default function BajaDeServicioPage() {
  return <ConsumerRequestForm tipo="baja" />;
}
