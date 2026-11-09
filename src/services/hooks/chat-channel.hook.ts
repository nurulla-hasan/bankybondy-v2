"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  findPendingTwinClientId,
  insertMessageIntoThread,
  type ThreadPages,
} from "@/lib/chat/cache";
import { chatKeys } from "@/lib/chat/keys";
import { senderIdOf } from "@/lib/chat/normalize";
import { conversationTarget } from "@/lib/chat/target";
import { playSendSound } from "@/lib/sound";
import { useChatSocket } from "@/provider/chat-socket.provider";
import type { RawConversationListItem, WireChatMessage } from "@/types";

import { useMarkSeen } from "./chat.hook";

/**
 * Subscribe the open thread to `message-<target>`. The provider handles events
 * that are global (list + unread); this one is per conversation and is cleaned
 * up the moment the thread closes or switches.
 */
export function useConversationChannel(
  conversation: RawConversationListItem,
  meId: string,
) {
  const { socket } = useChatSocket();
  const queryClient = useQueryClient();
  const { mutate: markSeen } = useMarkSeen();

  const target = conversationTarget(conversation);
  const conversationId = conversation._id;

  useEffect(() => {
    if (!socket || !target) return;

    const event = `message-${target}`;
    const onMessage = (message: WireChatMessage) => {
      const key = chatKeys.thread(conversationId);
      const data = queryClient.getQueryData<ThreadPages>(key);

      if (data) {
        // A socket send has no ack; the echo that replaces MY pending bubble is
        // the confirmation, so the outgoing tick plays here, exactly once.
        const confirmsPending = findPendingTwinClientId(data, message, meId);

        queryClient.setQueryData<ThreadPages>(key, (current) =>
          insertMessageIntoThread(current, message, meId),
        );

        if (confirmsPending) playSendSound();
      } else {
        // The first page is still in flight. It may have been requested before
        // this message was stored, so refetching is the only way not to lose it.
        void queryClient.invalidateQueries({ queryKey: key });
      }

      // A message from the peer while the thread is on screen is read by
      // definition. A hidden tab keeps the pill: it was not read.
      if (
        senderIdOf(message) !== meId &&
        document.visibilityState === "visible"
      ) {
        markSeen(conversationId);
      }
    };

    socket.on(event, onMessage);

    return () => {
      socket.off(event, onMessage);
    };
  }, [socket, target, conversationId, meId, queryClient, markSeen]);

  // Opening a thread marks it read; so does bringing a hidden tab back to it.
  useEffect(() => {
    if (conversationId.startsWith("pending-")) return;
    const mark = () => {
      if (document.visibilityState === "visible") markSeen(conversationId);
    };

    mark();
    document.addEventListener("visibilitychange", mark);

    return () => document.removeEventListener("visibilitychange", mark);
  }, [conversationId, markSeen]);
}
