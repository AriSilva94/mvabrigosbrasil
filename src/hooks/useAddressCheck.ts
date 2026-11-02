import { useState, useCallback, useEffect, useRef } from "react";
import {
  checkShelterAddress,
  type AddressCheckResult,
} from "@/modules/shelter/shelterProfileApi";

export function useAddressCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const checkAddress = useCallback(async (
    cep: string,
    street?: string,
    number?: string | number,
  ): Promise<AddressCheckResult | null> => {
    const requestId = ++requestRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      const data = await checkShelterAddress(
        cep,
        street,
        number,
        controller.signal,
      );
      if (requestId !== requestRef.current) return null;
      return data;
    } catch (err) {
      if (controller.signal.aborted || requestId !== requestRef.current) return null;
      const message =
        err instanceof Error ? err.message : "Erro ao verificar endereço";
      setError(message);
      return null;
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(
    () => () => {
      requestRef.current += 1;
      abortRef.current?.abort();
    },
    [],
  );

  return {
    isLoading,
    error,
    checkAddress,
    clearError,
  };
}
