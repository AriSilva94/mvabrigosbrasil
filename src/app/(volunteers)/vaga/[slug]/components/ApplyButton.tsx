"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { openChatWidget } from "@/components/chat-widget";

interface ApplyButtonProps {
  vacancyId: string;
  vacancyTitle: string;
  hasApplied: boolean;
  isAuthenticated: boolean;
  threadId?: string | null;
}

export default function ApplyButton({
  vacancyId,
  vacancyTitle,
  hasApplied,
  isAuthenticated,
  threadId,
}: ApplyButtonProps) {
  const [isApplying, setIsApplying] = useState(false);
  const router = useRouter();

  async function handleApply() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/vaga/${vacancyId}`);
      return;
    }

    try {
      setIsApplying(true);

      const response = await fetch(`/api/vacancies/${vacancyId}/apply`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao se candidatar");
      }

      toast.success(`Candidatura enviada para "${vacancyTitle}"!`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao se candidatar"
      );
    } finally {
      setIsApplying(false);
    }
  }

  if (hasApplied) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-green-100 px-6 py-3 text-sm font-semibold text-green-800">
          ✓ Já candidatado
        </span>
        {threadId && (
          <button
            type="button"
            onClick={() => openChatWidget({ threadId })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <MessageCircle className="h-4 w-4" />
            Conversar com Abrigo
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={isApplying}
      className="inline-flex items-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isApplying ? "Enviando..." : "Candidatar-se"}
    </button>
  );
}
