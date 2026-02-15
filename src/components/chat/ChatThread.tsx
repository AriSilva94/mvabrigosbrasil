"use client";

import { useEffect, useRef, useCallback, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

type ChatThreadProps = {
  threadId: string;
  otherParticipantName: string;
  vacancyTitle: string;
  hideHeader?: boolean;
  onMarkAsRead?: () => void;
};

export default function ChatThread({
  threadId,
  otherParticipantName,
  vacancyTitle,
  hideHeader = false,
  onMarkAsRead,
}: ChatThreadProps) {
  const { user } = useAuth();
  const { messages, isLoading, hasMore, error, fetchMessages, addMessage, replaceOptimistic, sendMessage } = useChatMessages();
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);
  // Rastrear IDs de mensagens enviadas por este usuário para ignorar no Realtime
  const sentMessageIdsRef = useRef<Set<string>>(new Set());
  // Flag para saber se o usuário acabou de enviar uma mensagem
  const justSentRef = useRef(false);
  // Flag para scroll inicial
  const isInitialLoadRef = useRef(true);

  // Verifica se o scroll está no final (com margem de 100px)
  const isNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  // Rola o container de mensagens para o final (sem afetar o scroll da página)
  const scrollContainerToBottom = useCallback((smooth = false) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Carregar mensagens iniciais
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchMessages(threadId);
    }
  }, [threadId, fetchMessages]);

  // Scroll to bottom: só no load inicial, quando o próprio usuário envia, ou quando já estava no final
  useEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0) {
      isInitialLoadRef.current = false;
      scrollContainerToBottom(false);
      return;
    }

    if (justSentRef.current) {
      justSentRef.current = false;
      scrollContainerToBottom(true);
      return;
    }

    // Mensagem de outro participante: só rola se já estava no final
    if (isNearBottom()) {
      scrollContainerToBottom(true);
    }
  }, [messages.length, isNearBottom, scrollContainerToBottom]);

  // Marcar como lido ao abrir e ao sair (unmount)
  useEffect(() => {
    const markAsRead = () =>
      fetch(`/api/threads/${threadId}/read`, { method: "POST" })
        .then(() => onMarkAsRead?.())
        .catch(() => {});

    markAsRead();

    return () => {
      markAsRead();
    };
  }, [threadId, onMarkAsRead]);

  // Realtime: novas mensagens (apenas do outro participante)
  const handleNewMessage = useCallback(
    (message: Parameters<typeof addMessage>[0]) => {
      // Ignorar mensagens que este usuário enviou (já temos via optimistic update)
      if (sentMessageIdsRef.current.has(message.id)) {
        sentMessageIdsRef.current.delete(message.id);
        return;
      }
      addMessage(message);
      // Marcar como lido se a thread está aberta
      fetch(`/api/threads/${threadId}/read`, { method: "POST" })
        .then(() => onMarkAsRead?.())
        .catch(() => {});
    },
    [addMessage, threadId, onMarkAsRead]
  );

  useChatRealtime(threadId, handleNewMessage);

  // Carregar histórico (scroll para cima)
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || messages.length === 0) return;
    const oldestMessage = messages[0];
    fetchMessages(threadId, oldestMessage.created_at);
  }, [hasMore, isLoading, messages, threadId, fetchMessages]);

  // Enviar mensagem
  const handleSend = useCallback(async (content: string) => {
    if (!user) return;

    setIsSending(true);

    const tempId = `temp-${Date.now()}`;

    // Optimistic update
    const optimisticMsg = {
      id: tempId,
      thread_id: threadId,
      sender_id: user.id,
      content,
      message_type: "text" as const,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    justSentRef.current = true;
    addMessage(optimisticMsg);

    const result = await sendMessage(threadId, content);

    if (result) {
      // Registrar o ID real para ignorar quando chegar pelo Realtime
      sentMessageIdsRef.current.add(result.id);
      // Substituir mensagem otimista pela real
      replaceOptimistic(tempId, result);
    }

    setIsSending(false);
  }, [user, threadId, addMessage, replaceOptimistic, sendMessage]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {!hideHeader && (
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {otherParticipantName}
          </h2>
          <p className="text-xs text-slate-500">Vaga: {vacancyTitle}</p>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {/* Load more */}
        {hasMore && (
          <div className="mb-4 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="text-xs font-medium text-brand-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? "Carregando..." : "Carregar mensagens anteriores"}
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && messages.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse ${i % 2 === 0 ? "" : "ml-auto"} h-10 w-2/3 rounded-lg bg-slate-100`}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-400">Nenhuma mensagem ainda. Diga olá!</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
            isOptimistic={message.id.startsWith("temp-")}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}
