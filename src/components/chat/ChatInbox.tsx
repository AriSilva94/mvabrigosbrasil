"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

import type { ChatThreadWithMeta } from "@/types/chat.types";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
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

export default function ChatInbox() {
  const [threads, setThreads] = useState<ChatThreadWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThreads() {
      try {
        const res = await fetch("/api/threads");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erro ao carregar conversas");
          return;
        }

        setThreads(data.threads || []);
      } catch {
        setError("Erro de conexão");
      } finally {
        setIsLoading(false);
      }
    }

    fetchThreads();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-slate-100 p-4">
            <div className="mb-2 h-4 w-2/3 rounded bg-slate-200" />
            <div className="mb-1 h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-slate-300" />
        <h3 className="mb-1 text-lg font-semibold text-slate-700">
          Nenhuma conversa ainda
        </h3>
        <p className="text-sm text-slate-500">
          Candidate-se a uma vaga para iniciar uma conversa com o abrigo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`/mensagens/${thread.id}`}
          className="block rounded-lg border border-slate-200 p-4 transition hover:border-brand-primary/30 hover:bg-slate-50"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {thread.unread_count > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-xs font-bold text-white">
                    {thread.unread_count}
                  </span>
                )}
                <span className={`truncate text-sm font-semibold ${thread.unread_count > 0 ? "text-slate-900" : "text-slate-700"}`}>
                  {thread.other_participant_name}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Vaga: {thread.vacancy_title}
              </p>
              {thread.last_message && (
                <p className={`mt-1 text-sm ${thread.unread_count > 0 ? "font-medium text-slate-700" : "text-slate-500"}`}>
                  {truncate(thread.last_message.content, 60)}
                </p>
              )}
            </div>
            {thread.last_message && (
              <span className="shrink-0 text-xs text-slate-400">
                {formatTime(thread.last_message.created_at)}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
