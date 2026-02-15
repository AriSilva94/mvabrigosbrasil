"use client";

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import { SendHorizonal, X } from "lucide-react";

import type { ChatMessage } from "@/types/chat.types";
import EmojiPickerButton from "./EmojiPickerButton";

type ChatInputProps = {
  onSend: (content: string) => void;
  editingMessage?: ChatMessage | null;
  onCancelEdit?: () => void;
  onSaveEdit?: (messageId: string, content: string) => void;
};

export default function ChatInput({ onSend, editingMessage, onCancelEdit, onSaveEdit }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quando entra em modo edição, preencher o input com o conteúdo atual
  useEffect(() => {
    if (editingMessage) {
      setValue(editingMessage.content);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [editingMessage]);

  // Auto-resize do textarea conforme o conteúdo
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 120;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (editingMessage && onSaveEdit) {
      // Modo edição: salvar alteração
      if (trimmed !== editingMessage.content) {
        onSaveEdit(editingMessage.id, trimmed);
      } else {
        onCancelEdit?.();
      }
    } else {
      // Modo normal: enviar nova mensagem
      onSend(trimmed);
    }

    setValue("");

    // Manter foco no textarea para envio contínuo
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [value, onSend, editingMessage, onSaveEdit, onCancelEdit]);

  const handleCancelEdit = useCallback(() => {
    setValue("");
    onCancelEdit?.();
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [onCancelEdit]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setValue((prev) => prev + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setValue((prev) => prev.slice(0, start) + emoji + prev.slice(end));

    // Reposicionar cursor após o emoji inserido
    requestAnimationFrame(() => {
      const newPos = start + emoji.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape" && editingMessage) {
        e.preventDefault();
        handleCancelEdit();
      }
    },
    [handleSend, editingMessage, handleCancelEdit]
  );

  return (
    <div className="border-t border-slate-200 px-4 py-3">
      {/* Barra de edição */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
          <span className="text-xs font-medium text-amber-700">
            Editando mensagem
          </span>
          <button
            onClick={handleCancelEdit}
            className="text-amber-500 hover:text-amber-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editingMessage ? "Editar mensagem..." : "Digite sua mensagem..."}
          maxLength={5000}
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          style={{ minHeight: 40, maxHeight: 120 }}
        />
        <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
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
