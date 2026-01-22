import { useCallback, useEffect, useState } from "react";

import type { VolunteerProfileFormData } from "@/types/volunteer.types";

type VolunteerProfileResponse = {
  volunteer: Partial<VolunteerProfileFormData> | null;
};

export function useVolunteerProfile() {
  const [volunteer, setVolunteer] = useState<Partial<VolunteerProfileFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVolunteer = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/volunteer-profile");
      const data = (await response.json()) as VolunteerProfileResponse;

      if (!response.ok) {
        throw new Error((data as { error?: string })?.error || "Erro ao carregar cadastro.");
      }

      setVolunteer(data.volunteer ?? null);
    } catch (err) {
      console.error("useVolunteerProfile: erro ao buscar cadastro", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar cadastro.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVolunteer();
  }, [fetchVolunteer]);

  return {
    volunteer,
    isLoading,
    error,
    refresh: fetchVolunteer,
  };
}
