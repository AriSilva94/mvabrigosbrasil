"use client";

import Image from "next/image";

type ChatWidgetButtonProps = {
  onClick: () => void;
  unreadCount: number;
};

export default function ChatWidgetButton({
  onClick,
  unreadCount,
}: ChatWidgetButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Abrir mensagens"
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
    >
      <Image
        src="/assets/img/chat_online_icon.png?v=20260215"
        alt="Abrir chat online"
        width={112}
        height={112}
        quality={100}
        sizes="56px"
        className="h-full w-full rounded-full object-cover"
        unoptimized
        priority
      />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
