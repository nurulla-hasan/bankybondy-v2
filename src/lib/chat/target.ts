import type { RawConversationListItem } from "@/types";

/**
 * The room the server emits `message-<target>` on:
 * - 1-a-1: the PEER's profile id (the sender gets `message-<receiver>` and the
 *   receiver gets `message-<sender>`),
 * - chat group: `chatGroup._id`,
 * - bond link: `bondLink._id`.
 *
 * `handleChat.ts` and `createOneToOneMessage.ts` are the two places that decide
 * this; the UI must agree exactly or the thread stays silent.
 */
export function conversationTarget(
  conversation: RawConversationListItem,
): string | null {
  if (conversation.type === "one-two-one") {
    return conversation.userData?._id ?? null;
  }

  if (conversation.type === "chat-group") {
    return conversation.chatGroup?._id ?? null;
  }

  return conversation.bondLink?._id ?? null;
}
