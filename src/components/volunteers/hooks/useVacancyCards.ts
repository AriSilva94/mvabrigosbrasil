"use client";

import { useEffect, useState } from "react";
import type { VacancyCard } from "@/types/vacancy.types";
import { getPublicVacancies } from "@/modules/vacancies/vacanciesApi";
import { getInitialVacanciesTransition } from "@/modules/vacancies/vacancyCardsState";

type UseVacancyCardsResult = {
  vacancies: VacancyCard[];
  loading: boolean;
  error: Error | null;
};

const EMPTY_INITIAL_VACANCIES: VacancyCard[] = [];

export function useVacancyCards(initialVacancies: VacancyCard[] = EMPTY_INITIAL_VACANCIES): UseVacancyCardsResult {
  const [vacancies, setVacancies] = useState<VacancyCard[]>(initialVacancies);
  const [loading, setLoading] = useState(initialVacancies.length === 0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialTransition = getInitialVacanciesTransition(initialVacancies);
    if (initialTransition) {
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

  return getInitialVacanciesTransition(initialVacancies) ?? { vacancies, loading, error };
}
