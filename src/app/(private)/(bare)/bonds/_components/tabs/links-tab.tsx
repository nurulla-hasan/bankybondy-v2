"use client";

import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { TabsContent } from "@/components/ui/tabs";
import { useBondLinks } from "@/services";

import { BondLinkCard } from "../cards/bond-link-card";
import { EmptyState } from "../shared/empty-state";

export function LinksTab() {
  const t = useTranslations("Bonds");
  const { data: links } = useBondLinks();

  return (
    <TabsContent value="links" className="space-y-4">
      <h2 className="sr-only">{t("tabs.links")}</h2>

      {links.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <BondLinkCard key={link.id} link={link} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Link2 className="size-5" aria-hidden />}
          title={t("empty.linksTitle")}
          description={t("empty.linksDescription")}
        />
      )}
    </TabsContent>
  );
}
