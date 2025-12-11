"use client";

import { useEffect, useState } from "react";
import type { VolunteerCard } from "@/types/volunteer.types";

type UseVolunteerCardsResult = {
  volunteers: VolunteerCard[];
  loading: boolean;
  error: Error | null;
};

export function useVolunteerCards(): UseVolunteerCardsResult {
  const [volunteers, setVolunteers] = useState<VolunteerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadVolunteers() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/volunteers");

        if (!response.ok) {
          throw new Error("Falha ao carregar voluntários");
        }

        const data = await response.json();
        setVolunteers(data.volunteers || []);
      } catch (err) {
        console.error("useVolunteerCards - erro:", err);
        setError(err as Error);
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    }

    loadVolunteers();
  }, []);

  return { volunteers, loading, error };
}
