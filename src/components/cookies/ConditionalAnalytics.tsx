"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  COOKIE_CONSENT_NAME,
  parseConsent,
  type CookieConsentValue,
} from "@/lib/cookies/consent";

function getCookieValue(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export default function ConditionalAnalytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const check = () => {
      const raw = getCookieValue(COOKIE_CONSENT_NAME);
      const consent = parseConsent(raw);
      setAnalyticsAllowed(consent?.analytics ?? false);
    };

    check();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentValue>).detail;
      setAnalyticsAllowed(detail.analytics);
    };

    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  if (!analyticsAllowed) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
