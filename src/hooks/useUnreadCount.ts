import { useEffect, useState, useCallback, useRef } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

export function useUnreadCount(userId?: string) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchCount = useCallback(async () => {
    // Evita chamadas simultâneas
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const res = await fetch("/api/unread-count");
      if (!res.ok) {
        setCount(0);
        return;
      }
      const data = await res.json();
      setCount(data.count || 0);
    } catch {
      // Silently fail — badge is not critical
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Polling de fallback (60s em vez de 30s, já que temos Realtime)
  useEffect(() => {
    fetchCount();

    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Realtime: escutar INSERTs em chat_messages
  // Quando chega uma mensagem de outro usuário → refetch imediato
  useEffect(() => {
    if (!userId) return;

    const supabase = getBrowserSupabaseClient();

    const channel = supabase
      .channel("unread-count-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as { sender_id?: string };
          // Só atualiza se a mensagem é de outra pessoa
          if (newMsg.sender_id && newMsg.sender_id !== userId) {
            fetchCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCount]);

  return { count, isLoading, refetch: fetchCount, setCount };
}
