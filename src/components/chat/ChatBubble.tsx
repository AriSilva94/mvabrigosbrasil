import clsx from "clsx";
import { Info } from "lucide-react";

import type { ChatMessage } from "@/types/chat.types";

type ChatBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  isOptimistic?: boolean;
};

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBubble({ message, isOwn, isOptimistic }: ChatBubbleProps) {
  // Mensagem de sistema
  if (message.message_type === "system") {
    return (
      <div className="my-3 flex items-center justify-center gap-2">
        <Info className="h-3.5 w-3.5 text-slate-400" />
        <p className="text-center text-xs text-slate-400">{message.content}</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "mb-2 flex",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          isOwn
            ? "rounded-br-md bg-brand-primary text-white"
            : "rounded-bl-md bg-slate-100 text-slate-800",
          isOptimistic && "opacity-60"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={clsx(
            "mt-1 text-right text-[10px]",
            isOwn ? "text-white/70" : "text-slate-400"
          )}
        >
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
