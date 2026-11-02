"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getUnreadCount } from "@/modules/chat/chatApi";
import { useChatSocket } from "@/modules/chat/ChatSocketProvider";

const POLL_INTERVAL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 10_000;

export function useUnreadCount(userId?: string) {
  const socket = useChatSocket();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchCount = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setCount(await getUnreadCount(AbortSignal.timeout(REQUEST_TIMEOUT_MS)));
    } catch {
      // O badge não é crítico: mantém o último valor e tenta no próximo ciclo.
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const tick = () => void fetchCount();
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [userId, fetchCount]);

  useEffect(() => {
    if (!socket || !userId) return;
    const onMessage = (payload: { sender_id?: string }) => {
      if (payload.sender_id && payload.sender_id !== userId) void fetchCount();
    };
    socket.on("chat:message", onMessage);
    return () => {
      socket.off("chat:message", onMessage);
    };
  }, [socket, userId, fetchCount]);

  return { count, isLoading, refetch: fetchCount, setCount };
}
