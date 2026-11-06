"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { MessageGroup } from "@/components/ui/message";
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

/** How far from the bottom still counts as "reading the latest". */
const BOTTOM_SLOP_PX = 80;

/** Consecutive messages further apart than this stop looking like one thought. */
const GROUP_GAP_MS = 5 * 60_000;

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
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);

  // The scroll handler and the arrival effect both need the current pin state,
  // and neither may re-run the other's logic to get it.
  const atBottomRef = useRef(true);
  const seenRef = useRef({ conversationId: "", newestId: null as string | null });

  // The endpoint sorts newest-first, so the page has to be flipped to be read.
  const messages = useMemo(() => [...(data?.result ?? [])].reverse(), [data]);
  const days = useMemo(() => groupByDay(messages), [messages]);
  const newest = messages.at(-1)?._id ?? null;

  const pinTo = useCallback(
    (behavior: ScrollBehavior) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollTo({
        top: viewport.scrollHeight,
        // MotionConfig stops framer-motion, not a scroll we ask the DOM for.
        behavior: reduceMotion && behavior === "smooth" ? "auto" : behavior,
      });
    },
    [reduceMotion],
  );

  const pin = (value: boolean) => {
    atBottomRef.current = value;
    setAtBottom(value);
  };

  // A thread is read from the bottom. The shell keys this component by the
  // conversation, so a switch arrives as a fresh mount: pinned, nothing unseen.
  useEffect(() => {
    const previous = seenRef.current;
    seenRef.current = { conversationId: conversation._id, newestId: newest };
    if (!newest || newest === previous.newestId) return;

    // Opening a thread, or sending into one, is never "someone else's news".
    const switched = previous.conversationId !== conversation._id;
    if (switched || atBottomRef.current || messages.at(-1)?.isMyMessage) {
      // Scrolling to the end fires the handler, which clears the pill itself.
      pinTo(switched ? "auto" : "smooth");
      return;
    }

    setUnseen((count) => count + 1);
  }, [conversation._id, newest, messages, pinTo]);

  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const stuck =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < BOTTOM_SLOP_PX;

    if (stuck) setUnseen(0);
    if (stuck !== atBottomRef.current) pin(stuck);
  };

  const showJump = !atBottom || unseen > 0;

  const showAuthor = conversation.type !== "one-two-one";

  return (
    <>
      <ThreadHeader conversation={conversation} onBack={onBack} onHide={onHide} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={viewportRef}
          onScroll={onScroll}
          className={`${PANE_BODY} px-3 py-2`}
        >
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
                  <div className="space-y-3">
                    {days.map((day) => (
                      <section key={day.date} className="space-y-3">
                        <DaySeparator date={day.date} />
                        {day.runs.map((run) => (
                          <MessageGroup key={run[0]._id} className="gap-1.5">
                            {run.map((message, index) => (
                              <MessageBubble
                                key={message._id}
                                message={message}
                                showAuthor={showAuthor}
                                firstOfRun={index === 0}
                                lastOfRun={index === run.length - 1}
                              />
                            ))}
                          </MessageGroup>
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

        <AnimatePresence>
          {showJump ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-3 right-3"
            >
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-card/90 shadow-md backdrop-blur"
                onClick={() => {
                  pin(true);
                  setUnseen(0);
                  pinTo("smooth");
                }}
              >
                <ArrowDown aria-hidden />
                {unseen > 0 ? t("newMessages", { count: unseen }) : t("jumpToLatest")}
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <MessageComposer isPending={isSending} onSend={onSend} />
    </>
  );
}

interface DayGroup {
  date: string;
  /** Consecutive messages from the same sender, close enough in time to read as one block. */
  runs: RawChatMessage[][];
}

/**
 * Messages arrive oldest-first from the gateway. `createdAt` is an ISO string, so
 * the first ten characters are the UTC day — close enough to split a thread.
 */
function groupByDay(messages: RawChatMessage[]): DayGroup[] {
  const days: DayGroup[] = [];

  for (const message of messages) {
    const date = message.createdAt?.slice(0, 10);
    if (!date) continue;

    const day = days[days.length - 1];
    if (day?.date !== date) {
      days.push({ date, runs: [[message]] });
      continue;
    }

    const run = day.runs[day.runs.length - 1];
    const previous = run[run.length - 1];
    if (previous && inSameRun(previous, message)) run.push(message);
    else day.runs.push([message]);
  }

  return days;
}

function inSameRun(previous: RawChatMessage, message: RawChatMessage): boolean {
  if (previous.isMyMessage !== message.isMyMessage) return false;
  if (previous.msgByUserId !== message.msgByUserId) return false;

  const gap = Date.parse(message.createdAt ?? "") - Date.parse(previous.createdAt ?? "");

  return gap <= GROUP_GAP_MS;
}
