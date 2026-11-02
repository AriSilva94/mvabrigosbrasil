"use client";

import { useEffect, useRef } from "react";

import { chatMessageSchema } from "@/modules/chat/chatApi";
import { useChatSocket } from "@/modules/chat/ChatSocketProvider";
import type { ChatMessage } from "@/types/chat.types";

export function useChatRealtime(
  threadId: string | null,
  onNewMessage: (message: ChatMessage) => void,
  onMessageUpdated?: (message: ChatMessage) => void,
) {
  const socket = useChatSocket();
  const insertRef = useRef(onNewMessage);
  const updateRef = useRef(onMessageUpdated);

  useEffect(() => {
    insertRef.current = onNewMessage;
    updateRef.current = onMessageUpdated;
  });

  useEffect(() => {
    if (!socket || !threadId) return;

    const forThisThread = (payload: unknown): ChatMessage | null => {
      const parsed = chatMessageSchema.safeParse(payload);
      return parsed.success && parsed.data.thread_id === threadId ? parsed.data : null;
    };
    const onMessage = (payload: unknown) => {
      const message = forThisThread(payload);
      if (message) insertRef.current(message);
    };
    const onUpdated = (payload: unknown) => {
      const message = forThisThread(payload);
      if (message) updateRef.current?.(message);
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:message-updated", onUpdated);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:message-updated", onUpdated);
    };
  }, [socket, threadId]);
}
