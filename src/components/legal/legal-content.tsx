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
    <div
      className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&_h1]:scroll-mt-24 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80 [&_strong]:text-foreground [&_b]:text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
