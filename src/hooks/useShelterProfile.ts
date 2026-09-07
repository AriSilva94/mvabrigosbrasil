import { useCallback, useEffect, useState } from "react";

import { getShelterProfile } from "@/modules/shelter/shelterProfileApi";
import type { ShelterProfileFormData } from "@/types/shelter.types";

export function useShelterProfile() {
  const [shelter, setShelter] = useState<Partial<ShelterProfileFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShelter = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getShelterProfile(signal);
      setShelter(data.shelter ?? null);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("useShelterProfile: erro ao buscar cadastro", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void getShelterProfile(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setShelter(data.shelter ?? null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error("useShelterProfile: erro ao buscar cadastro", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchShelter();
  }, [fetchShelter]);

  return {
    shelter,
    isLoading,
    error,
    refresh,
  };
}
