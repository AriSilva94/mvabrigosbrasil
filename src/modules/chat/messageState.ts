import type { ChatMessage } from "@/types/chat.types";

// O remetente já tem a própria mensagem pelo envio otimista + resposta do
// POST; aceitar o evento do socket também duplicaria o balão.
export function mergeIncomingMessage(
  list: ChatMessage[],
  incoming: ChatMessage,
  selfId: string,
): ChatMessage[] {
  if (incoming.sender_id === selfId) return list;
  if (list.some((message) => message.id === incoming.id)) return list;
  return [...list, incoming];
}

export function applyMessageUpdate(list: ChatMessage[], updated: ChatMessage): ChatMessage[] {
  return list.map((message) =>
    message.id === updated.id
      ? {
          ...message,
          status: updated.status,
          content: updated.content,
          edited_at: updated.edited_at,
          updated_at: updated.updated_at,
        }
      : message,
  );
}

export function replaceOptimistic(list: ChatMessage[], tempId: string, real: ChatMessage): ChatMessage[] {
  if (list.some((message) => message.id === real.id)) {
    return list.filter((message) => message.id !== tempId);
  }
  return list.map((message) => (message.id === tempId ? real : message));
}

export function prependPage(list: ChatMessage[], page: ChatMessage[]): ChatMessage[] {
  const known = new Set(list.map((message) => message.id));
  return [...page.filter((message) => !known.has(message.id)), ...list];
}
