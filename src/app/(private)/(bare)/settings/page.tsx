import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";
import { Button } from "@/components/ui/button";
import { MySettings } from "@/app/(private)/(bare)/settings/_components/my-settings";

export default function SettingsPage() {
  return (
    <PageWrapper className="space-y-6 relative">
      <Button
        size="icon"
        variant="secondary"
        className="absolute left-2 top-2 z-10"
        render={<Link href="/profile" />}
      >
        <ArrowLeft aria-hidden />
      </Button>

      <Suspense fallback={null}>
        <MySettings />
      </Suspense>
    </PageWrapper>
  );
}
