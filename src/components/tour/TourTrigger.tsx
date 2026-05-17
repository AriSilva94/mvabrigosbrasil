"use client";

import type { TourName } from "@/lib/tour-steps";
import { useAuth } from "@/hooks/useAuth";
import { useTourStatus } from "@/hooks/useTourStatus";

interface TourTriggerProps {
  tourName: TourName;
}

export function TourTrigger({ tourName }: TourTriggerProps) {
  const { user } = useAuth();

  useTourStatus(tourName, user?.id ?? null);

  return null;
}
