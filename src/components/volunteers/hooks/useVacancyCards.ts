"use client";

import { useEffect, useState } from "react";
import type { VacancyCard } from "@/types/vacancy.types";

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
    async function loadVacancies() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/public-vacancies");

        if (!response.ok) {
          throw new Error("Falha ao carregar vagas");
        }

        const data = await response.json();
        setVacancies(data.vacancies || []);
      } catch (err) {
        console.error("useVacancyCards - erro:", err);
        setError(err as Error);
        setVacancies([]);
      } finally {
        setLoading(false);
      }
    }

    if (initialVacancies.length === 0) {
      loadVacancies();
    } else {
      setLoading(false);
    }
  }, [initialVacancies]);

  return { vacancies, loading, error };
}
