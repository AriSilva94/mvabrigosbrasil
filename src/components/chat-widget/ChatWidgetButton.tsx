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
      className="fixed bottom-4 right-4 z-50 h-14 w-14 will-change-transform transition-transform hover:scale-110 active:scale-95 md:bottom-6 md:right-6"
    >
      <div className="h-full w-full overflow-hidden rounded-full bg-white">
        <Image
          src="/assets/img/chat_online_icon.png"
          alt="Abrir chat online"
          width={200}
          height={200}
          quality={100}
          className="h-full w-full object-cover"
        />
      </div>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
