import { Suspense } from "react";

import { ChattingFeed } from "./_components/feed/chatting-feed";

export default function ChattingPage() {
  return (
    <Suspense fallback={null}>
      <ChattingFeed />
    </Suspense>
  );
}
