import { FileText } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";

interface LegalContentProps {
  html: string | null;
  emptyTitle: string;
  emptyDescription: string;
}

export function LegalContent({
  html,
  emptyTitle,
  emptyDescription,
}: LegalContentProps) {
  if (!html) {
    return (
      <EmptyState
        icon={<FileText className="size-5" aria-hidden />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <a
            href="mailto:bankybondyar@gmail.com"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            bankybondyar@gmail.com
          </a>
        }
      />
    );
  }

  return (
    <div className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
