import { useCallback, useEffect, useRef, useState } from "react";

import { LatestRequest } from "@/lib/async/latestRequest";
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
  const requests = useRef(new LatestRequest());

  const fetchValidation = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    await requests.current.run(() => getProfileValidation(signal), {
      onSuccess: setValidation,
      onError: (err) => {
        if (signal?.aborted) return;
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        console.error("useProfileValidation: erro", err);
      },
      onSettled: () => setIsLoading(false),
    });
  }, []);

  const refetch = useCallback(async () => {
    await fetchValidation();
  }, [fetchValidation]);

  useEffect(() => {
    const controller = new AbortController();
    const requestTracker = requests.current;
    void requestTracker.run(() => getProfileValidation(controller.signal), {
      onSuccess: setValidation,
      onError: (err) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        console.error("useProfileValidation: erro", err);
      },
      onSettled: () => setIsLoading(false),
    });
    return () => {
      controller.abort();
      requestTracker.invalidate();
    };
  }, [fetchValidation]);

  return { validation, isLoading, error, refetch };
}
