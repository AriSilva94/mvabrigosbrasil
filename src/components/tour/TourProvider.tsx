"use client";

import type { ReactNode } from "react";
import { NextStepProvider, NextStep } from "nextstepjs";
import { tours, TOUR_STORAGE_KEY } from "@/lib/tour-steps";
import { HomeTourCard } from "./HomeTourCard";

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  function handleComplete(tourName: string | null) {
    if (typeof window !== "undefined" && tourName) {
      const completed = JSON.parse(
        localStorage.getItem(TOUR_STORAGE_KEY) || "{}"
      );
      completed[tourName] = true;
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completed));
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
