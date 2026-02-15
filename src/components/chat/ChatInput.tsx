"use client";

import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";

type ChatInputProps = {
  onSend: (content: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setValue("");

    // Manter foco no textarea para envio contínuo
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t border-slate-200 px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          maxLength={5000}
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
