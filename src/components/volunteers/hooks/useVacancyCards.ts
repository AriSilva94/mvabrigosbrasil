"use client";

import { useEffect, useState } from "react";
import type { VacancyCard } from "@/types/vacancy.types";

type UseVacancyCardsResult = {
  vacancies: VacancyCard[];
  loading: boolean;
  error: Error | null;
};

export function useVacancyCards(): UseVacancyCardsResult {
  const [vacancies, setVacancies] = useState<VacancyCard[]>([]);
  const [loading, setLoading] = useState(true);
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

    loadVacancies();
  }, []);

  return { vacancies, loading, error };
}
