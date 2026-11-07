import { Suspense } from "react";

import { PageWrapper } from "@/components/common/page-wrapper";
import { MyProfileView } from "@/app/(shell)/(private)/(with-footer)/profile/_components/my-profile";

export default function ProfilePage() {
  return (
    <PageWrapper>
      <Suspense fallback={null}>
        <MyProfileView />
      </Suspense>
    </PageWrapper>
  );
}
