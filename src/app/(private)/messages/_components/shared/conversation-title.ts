import type { RawConversationListItem } from "@/types";

/**
 * What a row is called: the peer for a 1-a-1 chat, the group name for a chat
 * group, the bond link's name for a bond room. Falls back to member names when
 * a group was never named.
 */
export function getConversationTitle(
  conversation: RawConversationListItem,
): string {
  if (conversation.type === "bond-link-group") {
    return conversation.bondLink?.name ?? "";
  }

  if (conversation.type !== "one-two-one") {
    const name = conversation.chatGroup?.name?.trim();
    if (name) return name;

    return conversation.members
      .filter((member) => member._id !== conversation.userData?._id)
      .slice(0, 3)
      .map((member) => member.name.split(" ")[0])
      .join(", ");
  }

  return conversation.userData?.name ?? "";
}
