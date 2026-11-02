"use client";

import { useEffect, useState } from "react";
import type { VolunteerCard } from "@/types/volunteer.types";
import { getPublicVolunteerCards } from "@/modules/volunteers/volunteersApi";

type UseVolunteerCardsResult = {
  volunteers: VolunteerCard[];
  loading: boolean;
  error: Error | null;
};

export function useVolunteerCards(initialVolunteers: VolunteerCard[] = []): UseVolunteerCardsResult {
  const [volunteers, setVolunteers] = useState<VolunteerCard[]>(initialVolunteers);
  const [loading, setLoading] = useState(initialVolunteers.length === 0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialVolunteers.length > 0) {
      return;
    }

    const controller = new AbortController();
    async function loadVolunteers() {
      try {
        setLoading(true);
        setError(null);

        setVolunteers(await getPublicVolunteerCards(controller.signal));
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("useVolunteerCards - erro:", err);
        setError(err as Error);
        setVolunteers([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadVolunteers();
    return () => controller.abort();
  }, [initialVolunteers]);

  return { volunteers, loading, error };
}
