import { useCallback, useEffect, useState } from "react";

import type { VolunteerProfileFormData } from "@/types/volunteer.types";
import { getMyVolunteerProfile } from "@/modules/volunteers/volunteersApi";

export function useVolunteerProfile() {
  const [volunteer, setVolunteer] = useState<Partial<VolunteerProfileFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVolunteer = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyVolunteerProfile(signal);

      setVolunteer(data.volunteer ?? null);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("useVolunteerProfile: erro ao buscar cadastro", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void getMyVolunteerProfile(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setVolunteer(data.volunteer ?? null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error("useVolunteerProfile: erro ao buscar cadastro", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  return {
    volunteer,
    isLoading,
    error,
    refresh: fetchVolunteer,
  };
}
