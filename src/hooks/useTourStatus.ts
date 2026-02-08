"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { useNextStep } from "nextstepjs";
import { getTourStorageKey, type TourName } from "@/lib/tour-steps";

interface TourStatus {
  [key: string]: boolean;
}

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getTourSnapshot(tourName: TourName, userId: string | null): boolean {
  if (!userId) return true; // Sem usuário = não inicia tour
  const key = getTourStorageKey(userId);
  const stored = localStorage.getItem(key);
  const status: TourStatus = stored ? JSON.parse(stored) : {};
  return status[tourName] === true;
}

export function useTourStatus(tourName: TourName, userId: string | null) {
  const { startNextStep } = useNextStep();

  const hasCompleted = useSyncExternalStore(
    subscribe,
    () => getTourSnapshot(tourName, userId),
    () => true // Server snapshot: default true to avoid flash
  );

  const startTour = useCallback(() => {
    startNextStep(tourName);
  }, [startNextStep, tourName]);

  const resetTour = useCallback(() => {
    if (typeof window !== "undefined" && userId) {
      const key = getTourStorageKey(userId);
      const stored = localStorage.getItem(key);
      const status: TourStatus = stored ? JSON.parse(stored) : {};
      delete status[tourName];
      localStorage.setItem(key, JSON.stringify(status));
      emitChange();
    }
  }, [tourName, userId]);

  // Auto-start tour if not completed (with small delay for DOM to be ready)
  useEffect(() => {
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted, startTour]);

  return {
    hasCompleted,
    isReady: true,
    startTour,
    resetTour,
  };
}
