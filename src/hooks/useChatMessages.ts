import { useState, useCallback } from "react";

import type { ChatMessage } from "@/types/chat.types";

type UseChatMessagesReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchMessages: (threadId: string, cursor?: string | null) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  replaceOptimistic: (tempId: string, real: ChatMessage) => void;
  sendMessage: (threadId: string, content: string) => Promise<ChatMessage | null>;
};

export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (threadId: string, cursor?: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "30" });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/threads/${threadId}/messages?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao buscar mensagens");
        return;
      }

      if (cursor) {
        setMessages(prev => [...(data.messages || []), ...prev]);
      } else {
        setMessages(data.messages || []);
      }

      setHasMore(data.has_more || false);
    } catch {
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const replaceOptimistic = useCallback((tempId: string, real: ChatMessage) => {
    setMessages(prev =>
      prev.map(m => m.id === tempId ? real : m)
    );
  }, []);

  const sendMessage = useCallback(async (threadId: string, content: string): Promise<ChatMessage | null> => {
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar mensagem");
        return null;
      }

      return data.message;
    } catch {
      setError("Erro de conexão");
      return null;
    }
  }, []);

  return { messages, isLoading, hasMore, error, fetchMessages, addMessage, replaceOptimistic, sendMessage };
}
