"use client";

import Link from "next/link";
import { EyeOff, Handshake } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { PublicBondCard } from "@/app/(private)/(bare)/people/_components/profile/public-bond-card";
import type { MyProfile, RawPublicBond } from "@/types";

export function BondsTab({
  profile,
  bonds,
}: {
  profile: MyProfile;
  bonds: RawPublicBond[];
}) {
  const t = useTranslations("Profile");

  return (
    <TabsContent value="bonds" className="space-y-4">
      {!profile.bondsPublic ? (
        <p className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          <EyeOff className="size-3.5 shrink-0" aria-hidden />
          {t("bonds.hiddenNote")}
        </p>
      ) : null}

      {bonds.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bonds.map((bond) => (
            <PublicBondCard key={bond._id} bond={bond} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Handshake className="size-5" aria-hidden />}
          title={t("bonds.emptyTitle")}
          description={t("bonds.emptyDescription")}
          action={
            <Button render={<Link href="/bonds" />}>{t("bonds.emptyCta")}</Button>
          }
        />
      )}
    </TabsContent>
  );
}
