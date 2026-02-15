"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MessageSquare } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";
import type { ChatThreadWithMeta } from "@/types/chat.types";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function truncate(text: string, maxLen: number) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

type ChatWidgetInboxProps = {
  onSelectThread: (threadId: string, otherName: string, vacancyTitle: string) => void;
  isVisible?: boolean;
};

export default function ChatWidgetInbox({ onSelectThread, isVisible }: ChatWidgetInboxProps) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThreadWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedOnce = useRef(false);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/threads");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao carregar conversas");
        return;
      }

      setError(null);
      setThreads(data.threads || []);
    } catch {
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch inicial + re-fetch toda vez que o painel fica visível
  useEffect(() => {
    if (isVisible) {
      // Na primeira vez mostra skeleton, nas próximas atualiza silenciosamente
      if (!hasFetchedOnce.current) {
        setIsLoading(true);
      }
      fetchThreads();
      hasFetchedOnce.current = true;
    }
  }, [isVisible, fetchThreads]);

  // Realtime: atualizar inbox quando chega mensagem nova de outra pessoa
  useEffect(() => {
    if (!user?.id) return;

    const supabase = getBrowserSupabaseClient();

    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as { sender_id?: string };
          if (newMsg.sender_id && newMsg.sender_id !== user.id) {
            fetchThreads();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchThreads]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-slate-100 p-3">
            <div className="mb-2 h-3.5 w-2/3 rounded bg-slate-200" />
            <div className="mb-1 h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <MessageSquare className="mb-3 h-10 w-10 text-slate-300" />
        <h3 className="mb-1 text-sm font-semibold text-slate-700">
          Nenhuma conversa ainda
        </h3>
        <p className="text-xs text-slate-500">
          Candidate-se a uma vaga para iniciar uma conversa com o abrigo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto p-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() =>
            onSelectThread(
              thread.id,
              thread.other_participant_name,
              thread.vacancy_title,
            )
          }
          className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-brand-primary/30 hover:bg-slate-50"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {thread.unread_count > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-xs font-bold text-white">
                    {thread.unread_count}
                  </span>
                )}
                <span
                  className={`truncate text-sm font-semibold ${thread.unread_count > 0 ? "text-slate-900" : "text-slate-700"}`}
                >
                  {thread.other_participant_name}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Vaga: {thread.vacancy_title}
              </p>
              {thread.last_message && (
                <p
                  className={`mt-1 text-sm ${thread.unread_count > 0 ? "font-medium text-slate-700" : "text-slate-500"}`}
                >
                  {truncate(thread.last_message.content, 50)}
                </p>
              )}
            </div>
            {thread.last_message && (
              <span className="shrink-0 text-xs text-slate-400">
                {formatTime(thread.last_message.created_at)}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
