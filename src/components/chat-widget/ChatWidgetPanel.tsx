"use client";

import { X, ArrowLeft } from "lucide-react";

import ChatWidgetInbox from "./ChatWidgetInbox";
import ChatThread from "@/components/chat/ChatThread";

type CurrentThread = {
  id: string;
  otherName: string;
  vacancyTitle: string;
};

type ChatWidgetPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  view: "inbox" | "thread";
  currentThread: CurrentThread | null;
  onSelectThread: (threadId: string, otherName: string, vacancyTitle: string) => void;
  onBackToInbox: () => void;
  onUnreadCountUpdate: (count: number) => void;
};

export default function ChatWidgetPanel({
  isOpen,
  onClose,
  view,
  currentThread,
  onSelectThread,
  onBackToInbox,
  onUnreadCountUpdate,
}: ChatWidgetPanelProps) {
  const title =
    view === "inbox"
      ? "Mensagens"
      : currentThread?.otherName || "Chat";

  const subtitle =
    view === "thread" && currentThread
      ? `Vaga: ${currentThread.vacancyTitle}`
      : undefined;

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        } inset-0 md:inset-auto md:bottom-24 md:right-6 md:h-[520px] md:w-[380px] md:rounded-xl`}
        role="dialog"
        aria-modal="true"
        aria-label="Chat"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            {view === "thread" && (
              <button
                onClick={onBackToInbox}
                className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Voltar para conversas"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-800">
                {title}
              </h2>
              {subtitle && (
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {view === "inbox" && (
            <ChatWidgetInbox onSelectThread={onSelectThread} isVisible={isOpen} />
          )}
          {view === "thread" && currentThread && (
            <ChatThread
              threadId={currentThread.id}
              otherParticipantName={currentThread.otherName}
              vacancyTitle={currentThread.vacancyTitle}
              hideHeader
              onUnreadCountUpdate={onUnreadCountUpdate}
            />
          )}
        </div>
      </div>
    </>
  );
}
