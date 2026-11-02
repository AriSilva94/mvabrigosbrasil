import clsx from "clsx";
import { Info, Pencil } from "lucide-react";

import type { ChatMessage } from "@/types/chat.types";
import MessageStatus from "./MessageStatus";

type ChatBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  isOptimistic?: boolean;
  onEdit?: (message: ChatMessage) => void;
};

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canEdit(message: ChatMessage, isOwn: boolean): boolean {
  if (!isOwn) return false;
  if (message.message_type !== "text") return false;
  if (message.id.startsWith("temp-")) return false;

  const createdAt = new Date(message.created_at).getTime();
  return Date.now() - createdAt <= EDIT_WINDOW_MS;
}

export default function ChatBubble({ message, isOwn, isOptimistic, onEdit }: ChatBubbleProps) {
  // Mensagem de sistema
  if (message.message_type === "system") {
    return (
      <div className="my-3 flex items-center justify-center gap-2">
        <Info className="h-3.5 w-3.5 text-slate-400" />
        <p className="text-center text-xs text-slate-400">{message.content}</p>
      </div>
    );
  }

  const editable = canEdit(message, isOwn);

  return (
    <div
      className={clsx(
        "group mb-2 flex items-end gap-1",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Botão editar (aparece no hover, antes do balão para mensagens próprias) */}
      {isOwn && editable && (
        <button
          onClick={() => onEdit?.(message)}
          className="mb-1 opacity-0 transition-opacity group-hover:opacity-100"
          title="Editar mensagem"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
        </button>
      )}

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
        <span
          className={clsx(
            "mt-1 flex items-center justify-end gap-0.5 text-[10px]",
            isOwn ? "text-white/70" : "text-slate-400"
          )}
        >
          {formatMessageTime(message.created_at)}
          {message.edited_at && (
            <span className="ml-1">(editada)</span>
          )}
          <MessageStatus
            status={message.status}
            isOptimistic={!!isOptimistic}
            isOwn={isOwn}
          />
        </span>
      </div>
    </div>
  );
}
