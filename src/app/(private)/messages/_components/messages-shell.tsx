"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { SearchInput } from "@/components/common/search-input";
import { useNextFilter } from "@/hooks/useNextFilter";
import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH, STICKY_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";

import {
  MOCK_ME_ID,
  useMockChatList,
  useMockMessages,
  useMockSend,
  type MockViewState,
} from "../_mock/mock-chat-gateway";
import { ConversationList } from "./list/conversation-list";
import { getConversationTitle } from "./shared/conversation-title";
import { NoConversationState } from "./shared/no-conversation-state";
import { PANE, PANE_BODY } from "./shared/pane";
import { MessageThread } from "./thread/message-thread";

type MessagesFilterKey = "c" | "searchTerm" | "mockState";

export function MessagesShell() {
  const t = useTranslations("Messages");
  const { getFilter, updateFilter } = useNextFilter<MessagesFilterKey>();

  const rawMockState = getFilter("mockState");
  const mockState: MockViewState | undefined =
    rawMockState === "empty" || rawMockState === "error" ? rawMockState : undefined;

  const selectedId = getFilter("c") || null;
  const searchTerm = getFilter("searchTerm") ?? "";

  const list = useMockChatList({ searchTerm, mockState });
  const thread = useMockMessages(selectedId);
  const send = useMockSend(() => {
    thread.invalidate();
    list.invalidate();
  });

  const conversation = list.data?.data.find((item) => item._id === selectedId) ?? null;

  const select = (conversationId: string) => {
    list.markRead(conversationId);
    updateFilter("c", conversationId, { resetPage: false, method: "push" });
  };

  const deselect = () => updateFilter("c", null, { resetPage: false, method: "push" });

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-4 overflow-hidden p-2 md:p-4",
        STICKY_HEIGHT,
        CONTAINER_GUTTER,
        CONTAINER_MAX_WIDTH,
      )}
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <section
          aria-label={t("chats")}
          className={cn(PANE, "lg:col-span-1", conversation && "hidden lg:flex")}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="font-heading text-base font-medium">{t("chats")}</h2>
            <SearchInput />
          </header>

          <div className={cn(PANE_BODY, "px-2 py-2")}>
            <ConversationList
              data={list.data}
              isPending={list.isPending}
              isError={list.isError}
              meId={MOCK_ME_ID}
              selectedId={selectedId}
              onSelect={select}
              onRetry={list.refetch}
            />
          </div>

          <p className="shrink-0 border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {t("mockNotice")}
          </p>
        </section>

        <section
          aria-label={conversation ? getConversationTitle(conversation) : t("noConversationTitle")}
          className={cn(
            PANE,
            "lg:col-span-2",
            conversation ? "flex" : "hidden lg:flex",
          )}
        >
          {conversation ? (
            /* Keyed by the thread, so switching conversations cross-fades and a
               draft never follows you from one chat into another. */
            <motion.div
              key={conversation._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <MessageThread
                conversation={conversation}
                data={thread.data}
                isPending={thread.isPending}
                isError={thread.isError}
                isSending={send.isPending}
                onBack={deselect}
                onHide={() => {
                  list.hide(conversation._id);
                  deselect();
                }}
                onRetry={thread.refetch}
                onSend={(payload) => send.mutate(conversation._id, payload)}
              />
            </motion.div>
          ) : (
            <div className={cn(PANE_BODY, "flex items-center justify-center p-4")}>
              <NoConversationState />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
