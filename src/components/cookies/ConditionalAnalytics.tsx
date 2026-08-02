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
  // Mirrors analyticsAllowed so the event handler below (registered once,
  // in an effect with an empty dependency array) always reads the current
  // value instead of the stale value captured at mount time.
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

      // If analytics was previously allowed and is now being revoked, the
      // GTM/GA scripts already executed: dataLayer, gtag, _ga* cookies and
      // any triggers registered inside the container keep running even
      // after we unmount <GoogleTagManager>/<GoogleAnalytics>. A full
      // reload is the only reliable way to actually stop tracking.
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
      {config.mode === "ga" && (
        <>
          <GoogleAnalytics gaId={config.gaId} />
          <Suspense fallback={null}>
            <RouteChangeTracker config={config} />
          </Suspense>
        </>
      )}
    </>
  );
}
