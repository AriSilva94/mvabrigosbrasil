import { useState, useCallback } from 'react';

interface Shelter {
  name: string;
  street: string;
  number: number;
  city: string;
  state: string;
}

interface AddressCheckResult {
  exists: boolean;
  count: number;
  shelters: Shelter[];
}

export function useAddressCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAddress = useCallback(async (
    cep: string,
    street?: string,
    number?: string | number
  ): Promise<AddressCheckResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ cep });
      if (street) params.append('street', street);
      if (number) params.append('number', number.toString());

      const response = await fetch(`/api/shelter-profile/check-address?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar endereço');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar endereço';
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
    checkAddress,
    clearError,
  };
}
