"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { applyToVacancy } from "@/modules/vacancies/vacanciesApi";
import { createExclusiveAction } from "@/modules/vacancies/exclusiveAction";

interface ApplyButtonProps {
  vacancyId: string;
  vacancyTitle: string;
  hasApplied: boolean;
  isAuthenticated: boolean;
}

export default function ApplyButton({
  vacancyId,
  vacancyTitle,
  hasApplied,
  isAuthenticated,
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
      <button
        type="button"
        disabled
        className="inline-flex items-center rounded-full bg-green-100 px-6 py-3 text-sm font-semibold text-green-800 cursor-not-allowed"
      >
        ✓ Já candidatado
      </button>
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
