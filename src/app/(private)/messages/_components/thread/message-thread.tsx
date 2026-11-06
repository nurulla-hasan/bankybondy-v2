"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import type {
  NewMessagePayload,
  RawConversationListItem,
  RawChatMessage,
  RawMessageList,
} from "@/types";

import { PANE_BODY } from "../shared/pane";
import { DaySeparator } from "./day-separator";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { ThreadHeader } from "./thread-header";
import { ThreadSkeleton } from "./thread-skeleton";

interface MessageThreadProps {
  conversation: RawConversationListItem;
  data: RawMessageList | null;
  isPending: boolean;
  isError: boolean;
  isSending: boolean;
  onBack: () => void;
  onHide: () => void;
  onRetry: () => void;
  onSend: (payload: NewMessagePayload) => void;
}

export function MessageThread({
  conversation,
  data,
  isPending,
  isError,
  isSending,
  onBack,
  onHide,
  onRetry,
  onSend,
}: MessageThreadProps) {
  const t = useTranslations("Messages");
  const viewportRef = useRef<HTMLDivElement>(null);

  // The endpoint sorts newest-first, so the page has to be flipped to be read.
  const messages = useMemo(() => [...(data?.result ?? [])].reverse(), [data]);
  const days = useMemo(() => groupByDay(messages), [messages]);

  // A thread is read from the bottom, so both a switch and a new message jump there.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [conversation._id, messages.length]);

  const showAuthor = conversation.type !== "one-two-one";

  return (
    <>
      <ThreadHeader conversation={conversation} onBack={onBack} onHide={onHide} />

      <div ref={viewportRef} className={`${PANE_BODY} px-3 py-2`}>
        {isError ? (
          <EmptyState
            icon={<WifiOff className="size-5" aria-hidden />}
            title={t("errorTitle")}
            description={t("errorDescription")}
            action={
              <Button variant="outline" onClick={onRetry}>
                {t("retry")}
              </Button>
            }
          />
        ) : null}

        {isPending ? <ThreadSkeleton /> : null}

        {!isPending && !isError ? (
          <>
            {messages.length ? (
              /* `initial={false}` so a loaded thread appears at once and only a
                 message that arrives later plays its entrance. */
              <AnimatePresence initial={false}>
                <div className="space-y-2">
                  {days.map((day) => (
                    <section key={day.date} className="space-y-2">
                      <DaySeparator date={day.date} />
                      {day.messages.map((message) => (
                        <MessageBubble
                          key={message._id}
                          message={message}
                          showAuthor={showAuthor}
                        />
                      ))}
                    </section>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("emptyDescription")}
              </p>
            )}

            {/* Paging is switched off server-side (`message.service.ts:150-158`). */}
            <div className="flex justify-center py-3">
              <Button variant="ghost" size="xs" disabled>
                {t("loadOlder")}
              </Button>
            </div>
          </>
        ) : null}
      </div>

      <MessageComposer isPending={isSending} onSend={onSend} />
    </>
  );
}

interface DayGroup {
  date: string;
  messages: RawChatMessage[];
}

/**
 * Messages arrive oldest-first from the gateway. `createdAt` is an ISO string, so
 * the first ten characters are the UTC day — close enough to split a thread.
 */
function groupByDay(messages: RawChatMessage[]): DayGroup[] {
  const groups: DayGroup[] = [];

  for (const message of messages) {
    const date = message.createdAt?.slice(0, 10);
    if (!date) continue;

    const last = groups[groups.length - 1];
    if (last?.date === date) last.messages.push(message);
    else groups.push({ date, messages: [message] });
  }

  return groups;
}
