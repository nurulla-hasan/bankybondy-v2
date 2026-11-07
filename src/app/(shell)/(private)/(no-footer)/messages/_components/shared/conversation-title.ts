import type { RawConversationListItem } from "@/types";

/**
 * What a row is called: the peer for a 1-a-1 chat, the group name for a chat
 * group, the bond link's name for a bond room. Falls back to member names when
 * a group was never named, then to `fallback` — a bond link with no name must
 * never render an empty title (the header would show only its icon).
 */
export function getConversationTitle(
  conversation: RawConversationListItem,
  fallback = "",
): string {
  const named = conversationName(conversation);
  if (named) return named;

  if (conversation.type === "one-two-one") {
    return conversation.userData?.name?.trim() || fallback;
  }

  const others = conversation.members
    .filter((member) => member._id !== conversation.userData?._id)
    .slice(0, 3)
    .map((member) => member.name.trim().split(" ")[0])
    .filter(Boolean)
    .join(", ");

  return others || fallback;
}

function conversationName(conversation: RawConversationListItem): string {
  if (conversation.type === "bond-link-group") {
    return conversation.bondLink?.name?.trim() ?? "";
  }

  if (conversation.type !== "one-two-one") {
    return conversation.chatGroup?.name?.trim() ?? "";
  }

  return conversation.userData?.name?.trim() ?? "";
}
