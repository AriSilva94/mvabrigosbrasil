"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import {
  COOKIE_CONSENT_NAME,
  parseConsent,
  type CookieConsentValue,
} from "@/lib/cookies/consent";
import { getAnalyticsConfig } from "@/lib/analytics/config";
import RouteChangeTracker from "./RouteChangeTracker";

function getCookieValue(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export default function ConditionalAnalytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const analyticsAllowedRef = useRef(analyticsAllowed);

  useEffect(() => {
    analyticsAllowedRef.current = analyticsAllowed;
  }, [analyticsAllowed]);

  useEffect(() => {
    const check = () => {
      const raw = getCookieValue(COOKIE_CONSENT_NAME);
      const consent = parseConsent(raw);
      setAnalyticsAllowed(consent?.analytics ?? false);
    };

    check();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentValue>).detail;

      if (analyticsAllowedRef.current && !detail.analytics) {
        window.location.reload();
        return;
      }

      setAnalyticsAllowed(detail.analytics);
    };

    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  if (!analyticsAllowed) return null;

  const config = getAnalyticsConfig();

  return (
    <>
      <Analytics />
      <SpeedInsights />
      {config.mode === "gtm" && (
        <>
          <GoogleTagManager gtmId={config.gtmId} />
          <Suspense fallback={null}>
            <RouteChangeTracker config={config} />
          </Suspense>
        </>
      )}
      {/* No modo `ga`, o gtag.js já registra page_view nas navegações client-side
          via Enhanced Measurement ("Page changes based on browser history events"),
          então não há rastreamento manual aqui para evitar page_view duplicado. */}
      {config.mode === "ga" && <GoogleAnalytics gaId={config.gaId} />}
    </>
  );
}
