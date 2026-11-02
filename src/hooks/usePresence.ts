"use client";

import { useCallback } from "react";

import { useOnlineIds } from "@/modules/chat/ChatSocketProvider";

// `userId` mantém a assinatura do hook original; a presença já vem
// restrita aos contatos do usuário logado pelo servidor.
export function usePresence(userId: string | undefined) {
  const onlineIds = useOnlineIds();
  const isOnline = useCallback(
    (profileId: string) => Boolean(userId) && onlineIds.has(profileId),
    [onlineIds, userId],
  );
  return { isOnline, onlineCount: userId ? onlineIds.size : 0 };
}
