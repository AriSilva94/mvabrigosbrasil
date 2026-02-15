"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Smile } from "lucide-react";
import dynamic from "next/dynamic";
import type { EmojiClickData } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-[300px] items-center justify-center rounded-lg border border-slate-200 bg-white shadow-lg">
      <span className="text-sm text-slate-400">Carregando...</span>
    </div>
  ),
});

type EmojiPickerButtonProps = {
  onEmojiSelect: (emoji: string) => void;
};

export default function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      onEmojiSelect(emojiData.emoji);
      setIsOpen(false);
    },
    [onEmojiSelect]
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        title="Emojis"
      >
        <Smile className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={350}
            searchPlaceholder="Buscar emoji..."
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  );
}
