import { useCallback, useEffect, useState } from "react";

import type { ShelterProfileFormData } from "@/types/shelter.types";

type ShelterProfileResponse = {
  shelter: Partial<ShelterProfileFormData> | null;
};

export function useShelterProfile() {
  const [shelter, setShelter] = useState<Partial<ShelterProfileFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShelter = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/shelter-profile");
      const data = (await response.json()) as ShelterProfileResponse;

      if (!response.ok) {
        throw new Error((data as { error?: string })?.error || "Erro ao carregar cadastro.");
      }

      setShelter(data.shelter ?? null);
    } catch (err) {
      console.error("useShelterProfile: erro ao buscar cadastro", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchShelter();
  }, [fetchShelter]);

  return {
    shelter,
    isLoading,
    error,
    refresh: fetchShelter,
  };
}
