"use client";

import { useEffect, useState } from "react";

import type {
  NewMessagePayload,
  PaginationMeta,
  RawChatMessage,
  RawConversationListItem,
  RawConversationList,
  RawMessageList,
} from "@/types";

import { getConversationTitle } from "../_components/shared/conversation-title";
import { MOCK_CONVERSATIONS, MOCK_ME_ID, MOCK_THREADS } from "./mock-chat-data";

/**
 * MOCK ONLY — delete this folder in phase 2 and re-point `messages-shell.tsx`
 * to `@/services`. Nothing here touches the network; the shapes are the real
 * backend ones so the swap is a fetcher change, not a rewrite.
 */

const LATENCY_MS = 300;
const LIMIT = 20;

export type MockViewState = "empty" | "error";

const store: {
  conversations: RawConversationListItem[];
  threads: Record<string, RawChatMessage[]>;
} = {
  conversations: [...MOCK_CONVERSATIONS],
  threads: { ...MOCK_THREADS },
};

const meta = (total: number): PaginationMeta => ({
  page: 1,
  limit: LIMIT,
  total,
  totalPages: total ? 1 : 0,
});

function readChatList(searchTerm: string, empty: boolean): RawConversationList {
  if (empty) return { meta: meta(0), data: [] };

  const term = searchTerm.trim().toLowerCase();

  const rows = store.conversations
    .filter((conversation) =>
      term ? getConversationTitle(conversation).toLowerCase().includes(term) : true,
    )
    .sort((a, b) => activityOf(b).localeCompare(activityOf(a)));

  return { meta: meta(rows.length), data: rows };
}

function activityOf(conversation: RawConversationListItem): string {
  return (
    conversation.lastMessage?.createdAt ??
    conversation.updated_at ??
    conversation.created_at ??
    ""
  );
}

function readThread(conversationId: string | null): RawMessageList | null {
  if (!conversationId) return null;

  // The cache is written in reading order; the wire is not, so hand back the
  // newest-first copy the real endpoint sends (`message.service.ts:214-222`).
  const result = [...(store.threads[conversationId] ?? [])].reverse();

  return { meta: meta(result.length), result };
}

/** MOCK-ONLY: components read the signed-in id from here, never from the data file. */
export { MOCK_ME_ID };

/**
 * MOCK-ONLY: `seenAt` is never written by the backend, so there is no read
 * receipt to clear the pill. Zeroing it locally is the one place phase 2 has to
 * drop a call rather than swap a fetcher.
 */
function markConversationRead(conversationId: string): void {
  const row = store.conversations.find((item) => item._id === conversationId);
  if (row) row.unseenMsg = 0;
}

/** MOCK-ONLY: appends into the in-memory thread so a sent message sticks. */
function appendMessage(conversationId: string, payload: NewMessagePayload): RawChatMessage {
  const createdAt = new Date().toISOString();

  const message: RawChatMessage = {
    _id: `m-${conversationId}-${Date.now()}`,
    text: payload.text,
    imageUrl: payload.imageUrl,
    videoUrl: [],
    pdfUrl: payload.pdfUrl,
    msgByUserId: MOCK_ME_ID,
    conversationId,
    createdAt,
    isDeleted: false,
    userDetails: { name: "You", profile_image: undefined },
    isMyMessage: true,
  };

  store.threads[conversationId] = [...(store.threads[conversationId] ?? []), message];

  const row = store.conversations.find((item) => item._id === conversationId);
  if (row) {
    row.lastMessage = message;
    row.updated_at = createdAt;
  }

  return message;
}

/** MOCK-ONLY: hides a conversation from the list, like PATCH /conversation/hide/:id. */
function hideConversation(conversationId: string): void {
  store.conversations = store.conversations.filter(
    (conversation) => conversation._id !== conversationId,
  );
}

/**
 * Reads are keyed by a token, so "loading" is derived by comparing tokens rather
 * than by setting state inside an effect — the same shape the query hooks present.
 */
export function useMockChatList(params: {
  searchTerm: string;
  mockState?: MockViewState;
}) {
  const { searchTerm, mockState } = params;
  const isError = mockState === "error";

  const [revision, setRevision] = useState(0);
  const token = `${searchTerm}|${revision}`;

  const [snapshot, setSnapshot] = useState<{ token: string; data: RawConversationList } | null>(
    null,
  );

  useEffect(() => {
    if (isError) return;

    const timer = setTimeout(() => {
      setSnapshot({ token, data: readChatList(searchTerm, mockState === "empty") });
    }, LATENCY_MS);

    return () => clearTimeout(timer);
  }, [token, searchTerm, mockState, isError]);

  /** MOCK-ONLY: writes straight into the cache, like a mutation's onSuccess. */
  const invalidate = () => {
    setSnapshot({ token, data: readChatList(searchTerm, mockState === "empty") });
  };

  return {
    data: snapshot?.data ?? null,
    isPending: !isError && snapshot?.token !== token,
    isError,
    refetch: () => setRevision((value) => value + 1),
    /** MOCK-ONLY: re-reads the cache without the latency. */
    invalidate,
    /** MOCK-ONLY: clears the unread pill when a thread opens. */
    markRead: (conversationId: string) => {
      markConversationRead(conversationId);
      invalidate();
    },
    /** MOCK-ONLY: hides the row, like PATCH /conversation/hide/:id. */
    hide: (conversationId: string) => {
      hideConversation(conversationId);
      invalidate();
    },
  };
}

export function useMockMessages(conversationId: string | null) {
  const [revision, setRevision] = useState(0);
  const token = `${conversationId ?? ""}|${revision}`;

  const [snapshot, setSnapshot] = useState<{
    token: string;
    data: RawMessageList | null;
  } | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const timer = setTimeout(() => {
      setSnapshot({ token, data: readThread(conversationId) });
    }, LATENCY_MS);

    return () => clearTimeout(timer);
  }, [token, conversationId]);

  return {
    data: snapshot?.token === token ? snapshot.data : null,
    isPending: Boolean(conversationId) && snapshot?.token !== token,
    isError: false,
    refetch: () => setRevision((value) => value + 1),
    /** MOCK-ONLY: re-reads the cache without the latency, for a local append. */
    invalidate: () => {
      if (!conversationId) return;
      setSnapshot({ token, data: readThread(conversationId) });
    },
  };
}

export function useMockSend(onSettled?: () => void) {
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    /** Resolves like the mutation hooks so phase 2 keeps the call sites. */
    mutate: (conversationId: string, payload: NewMessagePayload) => {
      const hasContent =
        Boolean(payload.text.trim()) || Boolean(payload.imageUrl.length + payload.pdfUrl.length);
      if (!conversationId || !hasContent) return;

      setIsPending(true);

      setTimeout(() => {
        appendMessage(conversationId, payload);
        setIsPending(false);
        onSettled?.();
      }, LATENCY_MS);
    },
  };
}
