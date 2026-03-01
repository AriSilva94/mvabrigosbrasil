import { Check, CheckCheck, Clock } from "lucide-react";

import type { ChatMessageStatus } from "@/types/chat.types";

type MessageStatusProps = {
  status: ChatMessageStatus;
  isOptimistic: boolean;
  isOwn: boolean;
};

export default function MessageStatus({ status, isOptimistic, isOwn }: MessageStatusProps) {
  if (!isOwn) return null;

  if (isOptimistic) {
    return (
      <Clock
        className="ml-1.5 inline-block h-3.5 w-3.5 text-white/60"
        strokeWidth={2.5}
        aria-label="Enviando"
      />
    );
  }

  if (status === "read") {
    return (
      <CheckCheck
        className="ml-1.5 inline-block h-4 w-4 text-blue-200"
        strokeWidth={3}
        aria-label="Lida"
      />
    );
  }

  // status === 'sent' (default)
  return (
    <Check
      className="ml-1.5 inline-block h-3.5 w-3.5 text-white/80"
      strokeWidth={3}
      aria-label="Enviada"
    />
  );
}
