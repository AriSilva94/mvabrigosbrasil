import { useCallback, useEffect, useState } from "react";

import type { RegisterType } from "@/constants/registerTypes";

export type ProfileValidationResult = {
  isValid: boolean;
  requiresProfileUpdate: boolean;
  missingFields: string[];
  registerType: RegisterType | null;
  profileExists: boolean;
};

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

  const fetchValidation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/validate-profile", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao validar perfil");
      }

      const data: ProfileValidationResult = await response.json();
      setValidation(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("useProfileValidation: erro", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchValidation();
  }, [fetchValidation]);

  useEffect(() => {
    fetchValidation();
  }, [fetchValidation]);

  return { validation, isLoading, error, refetch };
}
