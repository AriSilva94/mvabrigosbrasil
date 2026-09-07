import { useCallback, useEffect, useState } from "react";

import {
  getProfileValidation,
  type ProfileValidationResult,
} from "@/modules/shelter/shelterProfileApi";

export type { ProfileValidationResult } from "@/modules/shelter/shelterProfileApi";

type UseProfileValidationReturn = {
  validation: ProfileValidationResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useProfileValidation(): UseProfileValidationReturn {
  const [validation, setValidation] = useState<ProfileValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchValidation = useCallback(async (signal?: AbortSignal) => {
    try {
      setValidation(await getProfileValidation(signal));
    } catch (err) {
      if (signal?.aborted) return;
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("useProfileValidation: erro", err);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchValidation();
  }, [fetchValidation]);

  useEffect(() => {
    const controller = new AbortController();
    void getProfileValidation(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setValidation(result);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        console.error("useProfileValidation: erro", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { validation, isLoading, error, refetch };
}
