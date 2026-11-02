import type { ChatMessage } from "@/types/chat.types";

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
