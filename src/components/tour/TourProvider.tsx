"use client";

import type { ReactNode } from "react";
import { NextStepProvider, NextStep } from "nextstepjs";
import { tours, getTourStorageKey } from "@/lib/tour-steps";
import { HomeTourCard } from "./HomeTourCard";
import { useAuth } from "@/hooks/useAuth";

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { user } = useAuth();

  function handleComplete(tourName: string | null) {
    if (typeof window !== "undefined" && tourName) {
      const key = getTourStorageKey(user?.id);
      const completed = JSON.parse(
        localStorage.getItem(key) || "{}"
      );
      completed[tourName] = true;
      localStorage.setItem(key, JSON.stringify(completed));
    }
  }

  function handleSkip(_step: number, tourName: string | null) {
    // Também marca como completado quando o usuário pula
    handleComplete(tourName);
  }

  return (
    <NextStepProvider>
      <NextStep
        steps={tours}
        cardComponent={HomeTourCard}
        onComplete={handleComplete}
        onSkip={handleSkip}
        shadowRgb="16, 130, 89"
        shadowOpacity="0.3"
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}
