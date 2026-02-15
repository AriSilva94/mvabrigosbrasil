"use client";

import { X, ArrowLeft, MessageCircle, Briefcase } from "lucide-react";

import ChatWidgetInbox from "./ChatWidgetInbox";
import ChatThread from "@/components/chat/ChatThread";
import type { CurrentThread } from "@/types/chat.types";

type ChatWidgetPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  view: "inbox" | "thread";
  currentThread: CurrentThread | null;
  onSelectThread: (
    threadId: string,
    otherName: string,
    vacancyTitle: string,
    otherProfileId: string,
  ) => void;
  onBackToInbox: () => void;
  onUnreadCountUpdate: (count: number) => void;
  isOnline: (profileId: string) => boolean;
};

export default function ChatWidgetPanel({
  isOpen,
  onClose,
  view,
  currentThread,
  onSelectThread,
  onBackToInbox,
  onUnreadCountUpdate,
  isOnline,
}: ChatWidgetPanelProps) {
  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed z-50 flex flex-col overflow-hidden bg-gray-50 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        } inset-0 md:inset-auto md:bottom-24 md:right-6 md:h-[540px] md:w-[400px] md:rounded-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label="Chat"
      >
        {/* Header */}
        <div className="relative bg-brand-primary px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {view === "thread" ? (
                <button
                  onClick={onBackToInbox}
                  className="shrink-0 rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label="Voltar para conversas"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {view === "thread" &&
                    currentThread?.otherProfileId &&
                    isOnline(currentThread.otherProfileId) && (
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-green-400 ring-2 ring-white/20"
                        title="Online"
                      />
                    )}
                  <h2 className="truncate text-base font-semibold text-white">
                    {view === "inbox"
                      ? "Mensagens"
                      : currentThread?.otherName || "Chat"}
                  </h2>
                </div>
                {view === "thread" && currentThread && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Briefcase className="h-3 w-3 text-white/60 shrink-0" />
                    <p className="truncate text-xs text-white/70">
                      {currentThread.vacancyTitle}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          {view === "inbox" && (
            <ChatWidgetInbox
              onSelectThread={onSelectThread}
              isVisible={isOpen}
              isOnline={isOnline}
            />
          )}
          {view === "thread" && currentThread && (
            <ChatThread
              key={currentThread.id}
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
