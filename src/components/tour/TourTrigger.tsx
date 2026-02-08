"use client";

import type { TourName } from "@/lib/tour-steps";
import { useAuth } from "@/hooks/useAuth";
import { useTourStatus } from "@/hooks/useTourStatus";

interface TourTriggerProps {
  tourName: TourName;
}

/**
 * Componente invisível que dispara o tour automaticamente
 * quando o usuário ainda não completou o tour da página.
 */
export function TourTrigger({ tourName }: TourTriggerProps) {
  const { user } = useAuth();

  // O hook já cuida de iniciar o tour automaticamente se não foi completado
  // Passa o userId para que o status do tour seja por usuário
  useTourStatus(tourName, user?.id ?? null);

  // Componente invisível - apenas dispara o hook
  return null;
}
