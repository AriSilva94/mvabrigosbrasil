"use client";

import { MessageCircle } from "lucide-react";

import { openChatWidget } from "./index";

type OpenChatButtonProps = {
  threadId: string;
  label: string;
  otherName?: string;
};

export default function OpenChatButton({ threadId, label, otherName }: OpenChatButtonProps) {
  return (
    <button
      type="button"
      onClick={() => openChatWidget({ threadId, otherName })}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </button>
  );
}
