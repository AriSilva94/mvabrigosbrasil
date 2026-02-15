"use client";

import { MessageSquare } from "lucide-react";

type ChatWidgetButtonProps = {
  onClick: () => void;
  unreadCount: number;
};

export default function ChatWidgetButton({ onClick, unreadCount }: ChatWidgetButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Abrir mensagens"
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-primary/90 active:scale-95 md:bottom-6 md:right-6"
    >
      <MessageSquare className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
