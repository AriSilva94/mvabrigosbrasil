"use client";

import { useCallback, useState } from "react";

import * as chatApi from "@/modules/chat/chatApi";
import { prependPage, replaceOptimistic as replaceInList } from "@/modules/chat/messageState";
import type { ChatMessage } from "@/types/chat.types";

const REQUEST_TIMEOUT_MS = 10_000;

type UseChatMessagesReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchMessages: (threadId: string, cursor?: string | null) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  replaceOptimistic: (tempId: string, real: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  sendMessage: (threadId: string, content: string) => Promise<ChatMessage | null>;
  editMessage: (threadId: string, messageId: string, content: string) => Promise<ChatMessage | null>;
};

function errorMessage(error: unknown, fallback: string): string | null {
  if (error instanceof Error && error.name === "TimeoutError") return "Erro de conexão";
  if (error instanceof Error && error.name === "AbortError") return null;
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (threadId: string, cursor?: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const page = await chatApi.listMessages(threadId, cursor, AbortSignal.timeout(REQUEST_TIMEOUT_MS));
      setMessages((prev) => (cursor ? prependPage(prev, page.messages) : page.messages));
      setHasMore(page.has_more);
    } catch (err) {
      setError(errorMessage(err, "Erro ao buscar mensagens"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  const replaceOptimistic = useCallback((tempId: string, real: ChatMessage) => {
    setMessages((prev) => replaceInList(prev, tempId, real));
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m)));
  }, []);

  const sendMessage = useCallback(async (threadId: string, content: string) => {
    try {
      return await chatApi.sendMessage(threadId, content);
    } catch (err) {
      setError(errorMessage(err, "Erro ao enviar mensagem"));
      return null;
    }
  }, []);

  const editMessage = useCallback(async (threadId: string, messageId: string, content: string) => {
    try {
      return await chatApi.editMessage(threadId, messageId, content);
    } catch (err) {
      setError(errorMessage(err, "Erro ao editar mensagem"));
      return null;
    }
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    error,
    fetchMessages,
    addMessage,
    replaceOptimistic,
    updateMessage,
    sendMessage,
    editMessage,
  };
}
