"use client";

import { Link2, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { TabsContent } from "@/components/ui/tabs";
import { useBondLinks } from "@/services";

import { BondLinkCard } from "../cards/bond-link-card";
import { EmptyState } from "../shared/empty-state";

export function LinksTab({ searchTerm }: { searchTerm: string }) {
  const t = useTranslations("Bonds");
  const { data: links } = useBondLinks();

  const term = searchTerm.trim().toLowerCase();
  const visibleLinks = term
    ? links.filter((link) => link.name.toLowerCase().includes(term))
    : links;

  return (
    <TabsContent value="links" className="space-y-4">
      <h2 className="sr-only">{t("tabs.links")}</h2>

      {visibleLinks.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleLinks.map((link) => (
            <BondLinkCard key={link.id} link={link} />
          ))}
        </div>
      ) : term ? (
        <EmptyState
          icon={<SearchX className="size-5" aria-hidden />}
          title={t("searchEmptyTitle", { term: searchTerm.trim() })}
          description={t("searchEmptyDescription")}
        />
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
