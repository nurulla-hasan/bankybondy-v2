import { Suspense } from "react";

import { MessagesShell } from "./_components/messages-shell";

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesShell />
    </Suspense>
  );
}
