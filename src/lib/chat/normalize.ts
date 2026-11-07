import type { ConversationSnapshot } from "@/types/chat-socket.types";
import type {
  RawChatMessage,
  RawChatPerson,
  RawConversationListItem,
  WireChatMessage,
} from "@/types";

/**
 * The two shapes the chat module gets are not the two shapes it renders, and
 * the gap is small enough to hide a bug: a message that just arrived carries
 * `msgByUserId` as an OBJECT (and no `isMyMessage`, no `seen`), while a message
 * from the history page carries it as a string with both flags filled in.
 * Normalizing here — once — is what lets `message-thread.tsx` compare
 * `previous.msgByUserId !== message.msgByUserId` for grouping without two
 * different objects for the same sender breaking it on every arrival.
 */

export const senderIdOf = (message: WireChatMessage): string =>
  typeof message.msgByUserId === "string"
    ? message.msgByUserId
    : (message.msgByUserId?._id ?? "");

const senderCardOf = (
  message: WireChatMessage,
): Pick<RawChatPerson, "name" | "profile_image"> => {
  if (message.userDetails) return message.userDetails;
  // A populated sender still carries the card even if `userDetails` is missing
  // (an older backend, or a message whose author was deleted and never filled).
  if (typeof message.msgByUserId === "object") {
    return {
      name: message.msgByUserId.name,
      profile_image: message.msgByUserId.profile_image,
    };
  }
  return { name: "", profile_image: undefined };
};

/**
 * `meId` is the signed-in profile id: the server cannot fill `isMyMessage`
 * because one payload goes to both parties, so whoever receives it decides which
 * side it is on.
 */
export function toChatMessage(
  message: WireChatMessage,
  meId: string,
): RawChatMessage {
  const msgByUserId = senderIdOf(message);
  const isMyMessage = message.isMyMessage ?? msgByUserId === meId;

  return {
    ...message,
    msgByUserId,
    isMyMessage,
    userDetails: senderCardOf(message),
    // Only the history answers `seen`. A message that just reached an open
    // thread is treated as read, which is what happens to it a second later.
    seen: message.seen ?? !isMyMessage,
  };
}

/**
 * Merge-patch, never replace: the socket snapshot is NOT a chat-list row. It has
 * no `members`, its bond link has no `status`, and the peer image is camelCase.
 * Writing it over a row would erase the group avatars and the bond state.
 */
export function toRowPatch(
  snapshot: ConversationSnapshot,
  existing: RawConversationListItem | undefined,
): Partial<RawConversationListItem> {
  const patch: Partial<RawConversationListItem> = {
    type: snapshot.type,
    unseenMsg: snapshot.unseenMsg,
    lastMessage: snapshot.lastMessage,
  };

  if (snapshot.userData) {
    patch.userData = {
      _id: snapshot.userData._id,
      name: snapshot.userData.name,
      // camelCase on the socket, snake_case on the REST list — the row keeps the
      // REST spelling, so the rename has to happen here and nowhere else.
      profile_image: snapshot.userData.profileImage,
    };
  }

  if (snapshot.chatGroup) patch.chatGroup = snapshot.chatGroup;

  // `getSingleConversation` populates the bond link with `name` only, so the
  // status has to survive from the row we already have. With no row to take it
  // from, patching would invent a bond link without a status — better to leave
  // the key out and let the list query fill it.
  if (snapshot.bondLink && existing?.bondLink) {
    patch.bondLink = { ...existing.bondLink, name: snapshot.bondLink.name };
  }

  return patch;
}
