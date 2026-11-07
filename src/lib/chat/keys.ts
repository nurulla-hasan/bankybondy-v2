/**
 * Query keys for the chat module. One cache per search term for the list; one
 * infinite cache per conversation for the thread. `all` is the invalidation
 * root so the socket can patch every list variant without knowing the terms.
 */
export const chatKeys = {
  all: ["chat"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (searchTerm: string) => [...chatKeys.lists(), searchTerm] as const,
  messages: () => [...chatKeys.all, "messages"] as const,
  thread: (conversationId: string | null) =>
    [...chatKeys.messages(), conversationId] as const,
  unread: () => [...chatKeys.all, "unread"] as const,
  hidden: () => [...chatKeys.all, "hidden"] as const,
  media: (conversationId: string | null) =>
    [...chatKeys.all, "media", conversationId] as const,
  group: (groupId: string | null) => [...chatKeys.all, "group", groupId] as const,
};
