import { io, type Socket } from "socket.io-client";

export const CHAT_HEARTBEAT_MS = 30_000;

// Mesma origem do site: passa pelos rewrites do Next em dev e pelo Traefik
// em produção, levando o cookie de sessão. Sem barra final porque o Next
// redireciona `/socket.io/` com 308 e quebraria o handshake.
export function createChatSocket(): Socket {
  return io({
    path: "/api/v1/socket.io",
    addTrailingSlash: false,
    withCredentials: true,
    autoConnect: false,
    forceNew: true,
  });
}

// O servidor recusa o handshake sem access token válido e derruba o socket
// quando ele expira; renovar a sessão e reconectar mantém o chat vivo sem
// recarregar a página. Se a renovação falhar o usuário saiu, então para.
export function attachSessionRecovery(
  socket: Socket,
  refreshSession: () => Promise<unknown>,
): () => void {
  const recover = () => {
    refreshSession().then(
      () => socket.connect(),
      () => undefined,
    );
  };
  const onConnectError = (error: Error) => {
    if (error.message === "unauthorized") recover();
  };
  const onDisconnect = (reason: string) => {
    if (reason === "io server disconnect") recover();
  };

  socket.on("connect_error", onConnectError);
  socket.on("disconnect", onDisconnect);
  return () => {
    socket.off("connect_error", onConnectError);
    socket.off("disconnect", onDisconnect);
  };
}

export function startHeartbeat(socket: Socket): () => void {
  const timer = setInterval(() => {
    if (socket.connected) socket.emit("chat:heartbeat");
  }, CHAT_HEARTBEAT_MS);
  return () => clearInterval(timer);
}

export type PresenceEvent = { profileId: string; online: boolean };

export function applyPresenceEvent(
  current: ReadonlySet<string>,
  event: PresenceEvent,
): ReadonlySet<string> {
  const next = new Set(current);
  if (event.online) next.add(event.profileId);
  else next.delete(event.profileId);
  return next;
}
