"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { applyToVacancy } from "@/modules/vacancies/vacanciesApi";
import { createExclusiveAction } from "@/modules/vacancies/exclusiveAction";
import { openChatWidget } from "@/components/chat-widget";

interface ApplyButtonProps {
  vacancyId: string;
  vacancyTitle: string;
  hasApplied: boolean;
  isAuthenticated: boolean;
  threadId?: string | null;
  shelterProfileId?: string | null;
}

export default function ApplyButton({
  vacancyId,
  vacancyTitle,
  hasApplied,
  isAuthenticated,
  threadId,
  shelterProfileId,
}: ApplyButtonProps) {
  const [isApplying, setIsApplying] = useState(false);
  const router = useRouter();
  const applyAction = useRef(createExclusiveAction());
  useEffect(() => {
    const action = applyAction.current;
    action.activate();
    return () => action.dispose();
  }, []);

  async function handleApply() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/vaga/${vacancyId}`);
      return;
    }

    setIsApplying(true);
    await applyAction.current.run(() => applyToVacancy(vacancyId), {
      onSuccess: () => {
        toast.success(`Candidatura enviada para "${vacancyTitle}"!`);
        router.refresh();
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Erro ao se candidatar"),
      onSettled: () => setIsApplying(false),
    });
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
            onClick={() => openChatWidget({ threadId, otherProfileId: shelterProfileId || undefined })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
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
