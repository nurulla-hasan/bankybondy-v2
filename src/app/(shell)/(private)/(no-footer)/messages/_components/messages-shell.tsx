"use client";

import { motion } from "framer-motion";
import { EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { useNextFilter } from "@/hooks/useNextFilter";
import { useAuth } from "@/hooks/useAuth";
import { chatKeys } from "@/lib/chat/keys";
import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH, STICKY_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { useChatSocket } from "@/provider/chat-socket.provider";
import {
  createClientId,
  useChatList,
  useChatMessages,
  useConversationChannel,
  useDeleteMessage,
  useHideConversation,
  useSendMessage,
} from "@/services";
import type {
  ApiResponse,
  NewMessagePayload,
  RawChatPerson,
  RawConversationList,
  RawConversationListItem,
} from "@/types";

import { ChatSoundToggle } from "./chat-sound-toggle";
import { ConversationList } from "./list/conversation-list";
import { HiddenChatsSheet } from "./list/hidden-chats-sheet";
import { getConversationTitle } from "./shared/conversation-title";
import { NoConversationState } from "./shared/no-conversation-state";
import { PANE, PANE_BODY } from "./shared/pane";
import { MessageThread } from "./thread/message-thread";

type MessagesFilterKey = "c" | "searchTerm" | "userId" | "userName" | "userAvatar";

export function MessagesShell() {
  const t = useTranslations("Messages");
  const { getFilter, updateFilter } = useNextFilter<MessagesFilterKey>();
  const { user } = useAuth();
  const { status } = useChatSocket();

  const me = user
    ? {
        _id: user._id,
        name: user.name,
        profile_image: user.profile_image,
      }
    : null;
  const selectedId = getFilter("c") || null;
  const targetUserId = getFilter("userId") || null;
  const targetUserName = getFilter("userName") || "";
  const targetUserAvatar = getFilter("userAvatar") || "";
  const searchTerm = getFilter("searchTerm") ?? "";
  const [hiddenOpen, setHiddenOpen] = useState(false);

  const list = useChatList(searchTerm);
  // The open thread must survive list search: resolve it from the unfiltered
  // list (live query while searching, cached copy during the transition).
  const queryClient = useQueryClient();
  const allChats = useChatList("", {
    enabled: Boolean(searchTerm.trim()),
  });
  const hide = useHideConversation();

  const unfilteredChats =
    allChats.data ??
    queryClient.getQueryData<ApiResponse<RawConversationList>>(
      chatKeys.list(""),
    )?.data;

  // 1. Existing conversation matching selectedId
  let conversation =
    unfilteredChats?.data.find((item) => item._id === selectedId) ??
    list.data?.data.find((item) => item._id === selectedId) ??
    null;

  // 2. If targetUserId is passed in URL query (?userId=...), find or synthesize conversation
  if (!conversation && targetUserId) {
    const existingForUser = (unfilteredChats?.data ?? list.data?.data ?? []).find(
      (item) => item.type === "one-two-one" && item.userData?._id === targetUserId,
    );

    if (existingForUser) {
      conversation = existingForUser;
    } else {
      // Synthesized 1-to-1 conversation so the thread opens immediately
      conversation = {
        _id: `pending-${targetUserId}`,
        type: "one-two-one",
        userData: {
          _id: targetUserId,
          name: targetUserName || "User",
          profile_image: targetUserAvatar || undefined,
        },
        lastMessage: null,
        unseenMsg: 0,
        members: me ? [me, { _id: targetUserId, name: targetUserName || "User", profile_image: targetUserAvatar || undefined }] : [],
      };
    }
  }

  const showOffline = status === "disconnected" || status === "error";

  const select = (conversationId: string) => {
    updateFilter("c", conversationId, { resetPage: false, method: "push" });
  };

  const deselect = () => {
    updateFilter("c", null, { resetPage: false, method: "push" });
    if (targetUserId) {
      updateFilter("userId", null, { resetPage: false, method: "replace" });
      updateFilter("userName", null, { resetPage: false, method: "replace" });
      updateFilter("userAvatar", null, { resetPage: false, method: "replace" });
    }
  };

  const hideSelected = (conversationId: string) => {
    hide.mutate(conversationId);
    deselect();
  };

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
            <div className="flex flex-1 items-center justify-end gap-2">
              <SearchInput />
              <ChatSoundToggle />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("hiddenTitle")}
                onClick={() => setHiddenOpen(true)}
              >
                <EyeOff />
              </Button>
            </div>
          </header>

          <div className={cn(PANE_BODY, "px-2 py-2")}>
            <ConversationList
              data={list.data ?? null}
              isPending={list.isPending}
              isError={list.isError}
              meId={me?._id ?? ""}
              selectedId={selectedId}
              onSelect={select}
              onRetry={() => {
                void list.refetch();
              }}
            />
          </div>

          <HiddenChatsSheet
            open={hiddenOpen}
            onOpenChange={setHiddenOpen}
            onRestored={select}
          />

          {showOffline ? (
            <p
              role="status"
              className="shrink-0 border-t border-border px-4 py-2 text-xs text-muted-foreground"
            >
              {t("reconnecting")}
            </p>
          ) : null}
        </section>

        <section
          aria-label={
            conversation
              ? getConversationTitle(
                  conversation,
                  conversation.type === "bond-link-group"
                    ? t("bondRoomFallback")
                    : undefined,
                )
              : t("noConversationTitle")
          }
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
              <ConversationThread
                conversation={conversation}
                me={me}
                onBack={deselect}
                onHide={() => hideSelected(conversation._id)}
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

interface ConversationThreadProps {
  conversation: RawConversationListItem;
  me: Pick<RawChatPerson, "_id" | "name" | "profile_image"> | null;
  onBack: () => void;
  onHide: () => void;
}

/**
 * One thread, one set of hooks. Kept separate so the message query and its
 * socket channel mount and unmount with the conversation instead of trying to
 * re-key a listener from the shell.
 */
function ConversationThread({
  conversation,
  me,
  onBack,
  onHide,
}: ConversationThreadProps) {
  const meId = me?._id ?? "";
  const isPendingConversation = conversation._id.startsWith("pending-");
  const thread = useChatMessages(conversation._id, meId);
  const send = useSendMessage();
  const remove = useDeleteMessage(conversation._id);
  useConversationChannel(conversation, meId);

  const handleSend = async (payload: NewMessagePayload) => {
    if (!me) throw new Error("The signed-in profile is not ready yet");

    // `mutateAsync` rejects on failure, which is what tells the composer to keep
    // the draft and its already-uploaded attachments.
    await send.mutateAsync({
      conversation,
      payload,
      me,
      clientId: createClientId(),
    });
  };

  return (
    <MessageThread
      conversation={conversation}
      messages={thread.data?.messages ?? []}
      isPending={!isPendingConversation && (thread.isPending || !meId)}
      isError={!isPendingConversation && thread.isError}
      isSending={send.isPending}
      hasOlder={Boolean(thread.hasNextPage)}
      isLoadingOlder={thread.isFetchingNextPage}
      onBack={onBack}
      onHide={onHide}
      onRetry={() => {
        void thread.refetch();
      }}
      onLoadOlder={() => {
        void thread.fetchNextPage();
      }}
      onSend={handleSend}
      onDeleteMessage={(messageId) => remove.mutate(messageId)}
    />
  );
}
