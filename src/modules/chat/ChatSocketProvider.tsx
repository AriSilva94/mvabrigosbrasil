"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";

import { useAuth } from "@/hooks/useAuth";
import { refreshSession } from "@/lib/api/client";
import {
  applyPresenceEvent,
  attachSessionRecovery,
  createChatSocket,
  startHeartbeat,
  type PresenceEvent,
} from "./chatSocket";

type ChatSocketState = {
  socket: Socket | null;
  onlineIds: ReadonlySet<string>;
};

const NO_ONE_ONLINE: ReadonlySet<string> = new Set();

const ChatSocketContext = createContext<ChatSocketState>({ socket: null, onlineIds: NO_ONE_ONLINE });

// Uma conexão por aba, aberta só com usuário logado. A presença fica aqui
// porque o snapshot chega logo na conexão, antes de os componentes do chat
// montarem.
export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const socket = useMemo(() => (userId ? createChatSocket() : null), [userId]);
  const [presence, setPresence] = useState<{ socket: Socket | null; ids: ReadonlySet<string> }>({
    socket: null,
    ids: NO_ONE_ONLINE,
  });

  useEffect(() => {
    if (!socket) return;

    const detachRecovery = attachSessionRecovery(socket, refreshSession);
    const stopHeartbeat = startHeartbeat(socket);
    const onSnapshot = ({ online }: { online: string[] }) => setPresence({ socket, ids: new Set(online) });
    const onPresence = (event: PresenceEvent) =>
      setPresence((prev) => ({
        socket,
        ids: applyPresenceEvent(prev.socket === socket ? prev.ids : NO_ONE_ONLINE, event),
      }));

    socket.on("chat:presence-snapshot", onSnapshot);
    socket.on("chat:presence", onPresence);
    socket.connect();

    return () => {
      detachRecovery();
      stopHeartbeat();
      socket.off("chat:presence-snapshot", onSnapshot);
      socket.off("chat:presence", onPresence);
      socket.disconnect();
    };
  }, [socket]);

  const value = useMemo<ChatSocketState>(
    () => ({ socket, onlineIds: presence.socket === socket ? presence.ids : NO_ONE_ONLINE }),
    [socket, presence],
  );

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}

export function useChatSocket(): Socket | null {
  return useContext(ChatSocketContext).socket;
}

export function useOnlineIds(): ReadonlySet<string> {
  return useContext(ChatSocketContext).onlineIds;
}
