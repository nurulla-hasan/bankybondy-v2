import type { ReactNode } from "react";

import { PageWrapper } from "@/components/common/page-wrapper";

export default function ChattingLayout({ children }: { children: ReactNode }) {
  return <PageWrapper padding="compact">{children}</PageWrapper>;
}
