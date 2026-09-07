import { useCallback, useEffect, useRef, useState } from "react";

import { LatestRequest } from "@/lib/async/latestRequest";
import { getShelterProfile } from "@/modules/shelter/shelterProfileApi";
import type { ShelterProfileFormData } from "@/types/shelter.types";

export function useShelterProfile() {
  const [shelter, setShelter] = useState<Partial<ShelterProfileFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requests = useRef(new LatestRequest());

  const fetchShelter = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    await requests.current.run(() => getShelterProfile(signal), {
      onSuccess: (data) => setShelter(data.shelter ?? null),
      onError: (err) => {
        if (signal?.aborted) return;
        console.error("useShelterProfile: erro ao buscar cadastro", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
      },
      onSettled: () => setIsLoading(false),
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const requestTracker = requests.current;
    void requestTracker.run(() => getShelterProfile(controller.signal), {
      onSuccess: (data) => setShelter(data.shelter ?? null),
      onError: (err) => {
        if (controller.signal.aborted) return;
        console.error("useShelterProfile: erro ao buscar cadastro", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
      },
      onSettled: () => setIsLoading(false),
    });
    return () => {
      controller.abort();
      requestTracker.invalidate();
    };
  }, [fetchShelter]);

  const refresh = useCallback(async () => {
    await fetchShelter();
  }, [fetchShelter]);

  return {
    shelter,
    isLoading,
    error,
    refresh,
  };
}
