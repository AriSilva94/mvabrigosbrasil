"use client";

import { useEffect, useState } from "react";
import type { VacancyCard } from "@/types/vacancy.types";
import { getPublicVacancies } from "@/modules/vacancies/vacanciesApi";

type UseVacancyCardsResult = {
  vacancies: VacancyCard[];
  loading: boolean;
  error: Error | null;
};

export function useVacancyCards(initialVacancies: VacancyCard[] = []): UseVacancyCardsResult {
  const [vacancies, setVacancies] = useState<VacancyCard[]>(initialVacancies);
  const [loading, setLoading] = useState(initialVacancies.length === 0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialVacancies.length > 0) {
      return;
    }

    async function loadVacancies() {
      try {
        setLoading(true);
        setError(null);

        setVacancies(await getPublicVacancies(controller.signal));
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("useVacancyCards - erro:", err);
        setError(err as Error);
        setVacancies([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    const controller = new AbortController();
    loadVacancies();
    return () => controller.abort();
  }, [initialVacancies]);

  return { vacancies, loading, error };
}
