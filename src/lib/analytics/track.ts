"use client";

import { sendGAEvent, sendGTMEvent } from "@next/third-parties/google";
import { getAnalyticsConfig } from "./config";
import { COOKIE_CONSENT_NAME, hasConsent } from "@/lib/cookies/consent";

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  const config = getAnalyticsConfig();
  if (config.mode === "off") return;

  const consentRaw = getCookieValue(COOKIE_CONSENT_NAME);
  if (!hasConsent("analytics", consentRaw)) return;

  if (config.mode === "gtm") {
    const gtmEvent = { event: eventName };
    if (params) {
      Object.assign(gtmEvent, params);
    }
    sendGTMEvent(gtmEvent);
    return;
  }

  if (params) {
    sendGAEvent("event", eventName, params);
  } else {
    sendGAEvent("event", eventName);
  }
}
