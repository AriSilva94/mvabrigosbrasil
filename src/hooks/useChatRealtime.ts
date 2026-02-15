import { useEffect, useRef } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

import type { ChatMessage } from "@/types/chat.types";

export function useChatRealtime(
  threadId: string | null,
  onNewMessage: (message: ChatMessage) => void,
  onMessageUpdated?: (message: ChatMessage) => void
) {
  const insertRef = useRef(onNewMessage);
  insertRef.current = onNewMessage;

  const updateRef = useRef(onMessageUpdated);
  updateRef.current = onMessageUpdated;

  useEffect(() => {
    if (!threadId) return;

    const supabase = getBrowserSupabaseClient();

    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          insertRef.current(payload.new as ChatMessage);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          updateRef.current?.(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);
}
