"use client";

import { useEffect, useCallback, useState, useSyncExternalStore } from "react";
import { useNextStep } from "nextstepjs";
import { getTourStorageKey, type TourName } from "@/lib/tour-steps";
import { COOKIE_CONSENT_NAME, parseConsent } from "@/lib/cookies/consent";

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

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function hasCookieConsent(): boolean {
  return parseConsent(getCookieValue(COOKIE_CONSENT_NAME)) !== null;
}

export function useTourStatus(tourName: TourName, userId: string | null) {
  const { startNextStep } = useNextStep();
  const [consentGiven, setConsentGiven] = useState(() => hasCookieConsent());

  const hasCompleted = useSyncExternalStore(
    subscribe,
    () => getTourSnapshot(tourName, userId),
    () => true // Server snapshot: default true to avoid flash
  );

  // Ouvir mudanças de consentimento (disparado pelo CookieBanner)
  useEffect(() => {
    const handler = () => setConsentGiven(true);
    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

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

  // Auto-start tour somente se cookies foram aceitos E tour não foi completado
  useEffect(() => {
    if (!hasCompleted && consentGiven) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted, consentGiven, startTour]);

  return {
    hasCompleted,
    isReady: consentGiven,
    startTour,
    resetTour,
  };
}
