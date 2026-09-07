import { useState, useCallback, useRef } from "react";
import { fetchAddressFromCep, type ViaCepResponse } from "@/lib/validations/cep";
import { LatestRequest } from "@/lib/async/latestRequest";

type UseCepAutocompleteReturn = {
  isLoading: boolean;
  error: string | null;
  searchCep: (cep: string) => Promise<ViaCepResponse | null>;
  clearError: () => void;
};

export function useCepAutocomplete(): UseCepAutocompleteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requests = useRef(new LatestRequest());

  const searchCep = useCallback(async (cep: string) => {
    setIsLoading(true);
    setError(null);
    const data = await requests.current.run(() => fetchAddressFromCep(cep), {
      onSuccess: () => undefined,
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Erro ao buscar CEP";
        setError(message);
      },
      onSettled: () => setIsLoading(false),
    });
    return data ?? null;
  }, []);

  const clearError = useCallback(() => {
    requests.current.invalidate();
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    searchCep,
    clearError,
  };
}
