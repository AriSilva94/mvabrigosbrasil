"use client";

import type { TourName } from "@/lib/tour-steps";
import { useTourStatus } from "@/hooks/useTourStatus";

interface TourTriggerProps {
  tourName: TourName;
}

/**
 * Componente invisível que dispara o tour automaticamente
 * quando o usuário ainda não completou o tour da página.
 */
export function TourTrigger({ tourName }: TourTriggerProps) {
  // O hook já cuida de iniciar o tour automaticamente se não foi completado
  useTourStatus(tourName);

  // Componente invisível - apenas dispara o hook
  return null;
}
