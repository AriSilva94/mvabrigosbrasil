"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MessageSquare, Briefcase, ChevronRight, Inbox } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";
import OnlineIndicator from "@/components/chat/OnlineIndicator";
import type { ChatThreadWithMeta } from "@/types/chat.types";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function truncate(text: string, maxLen: number) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "\u2026";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type ChatWidgetInboxProps = {
  onSelectThread: (threadId: string, otherName: string, vacancyTitle: string, otherProfileId: string) => void;
  isVisible?: boolean;
  isOnline?: (profileId: string) => boolean;
};

export default function ChatWidgetInbox({ onSelectThread, isVisible, isOnline }: ChatWidgetInboxProps) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThreadWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedOnce = useRef(false);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/threads", {
        signal: AbortSignal.timeout(10_000),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao carregar conversas");
        return;
      }

      setError(null);
      setThreads(data.threads || []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch inicial + re-fetch toda vez que o painel fica visível
  useEffect(() => {
    if (isVisible) {
      if (!hasFetchedOnce.current) {
        setIsLoading(true);
      }
      fetchThreads();
      hasFetchedOnce.current = true;
    }
  }, [isVisible, fetchThreads]);

  // Realtime: atualizar inbox quando chega mensagem nova de outra pessoa
  // Filtra por thread_ids do usuário para evitar receber eventos de todas as threads do sistema
  useEffect(() => {
    if (!user?.id || threads.length === 0) return;

    const supabase = getBrowserSupabaseClient();
    const threadIds = threads.map(t => t.id).join(",");

    const channel = supabase
      .channel(`inbox-realtime-${threadIds.slice(0, 20)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=in.(${threadIds})`,
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
  }, [user?.id, fetchThreads, threads]);

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-100 p-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
            <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3.5 w-3/5 rounded bg-gray-200" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchThreads}
            className="mt-2 text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Inbox className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="mb-1.5 text-sm font-semibold text-gray-800">
          Nenhuma conversa ainda
        </h3>
        <p className="text-xs leading-relaxed text-gray-500">
          Candidate-se a uma vaga para iniciar uma conversa com o abrigo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {threads.map((thread) => {
        const hasUnread = thread.unread_count > 0;
        const otherProfileId =
          thread.volunteer_profile_id === user?.id
            ? thread.shelter_profile_id
            : thread.volunteer_profile_id;

        return (
          <button
            key={thread.id}
            onClick={() =>
              onSelectThread(
                thread.id,
                thread.other_participant_name,
                thread.vacancy_title,
                otherProfileId,
              )
            }
            className={`group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-brand-primary/5 ${
              hasUnread ? "bg-brand-primary/[0.03]" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${
                hasUnread
                  ? "bg-brand-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {getInitials(thread.other_participant_name)}
              </div>
              {hasUnread && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {thread.unread_count > 9 ? "9+" : thread.unread_count}
                </span>
              )}
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5">
                  <OnlineIndicator isOnline={isOnline(otherProfileId)} size="sm" />
                </span>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`truncate text-sm ${
                    hasUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"
                  }`}
                >
                  {thread.other_participant_name}
                </span>
                {thread.last_message && (
                  <span className={`shrink-0 text-[11px] ${
                    hasUnread ? "font-semibold text-brand-primary" : "text-gray-400"
                  }`}>
                    {formatTime(thread.last_message.created_at)}
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="truncate">{thread.vacancy_title}</span>
              </div>

              {thread.last_message && (
                <p
                  className={`mt-1 truncate text-[13px] leading-snug ${
                    hasUnread ? "font-medium text-gray-700" : "text-gray-500"
                  }`}
                >
                  {truncate(thread.last_message.content, 55)}
                </p>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400" />
          </button>
        );
      })}
    </div>
  );
}
