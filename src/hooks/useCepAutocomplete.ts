import { useState, useCallback } from "react";
import { fetchAddressFromCep, type ViaCepResponse } from "@/lib/validations/cep";

type UseCepAutocompleteReturn = {
  isLoading: boolean;
  error: string | null;
  searchCep: (cep: string) => Promise<ViaCepResponse | null>;
  clearError: () => void;
};

export function useCepAutocomplete(): UseCepAutocompleteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCep = useCallback(async (cep: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAddressFromCep(cep);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar CEP";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    searchCep,
    clearError,
  };
}
