export type AnalyticsConfig =
  | { mode: "off" }
  | { mode: "gtm"; gtmId: string }
  | { mode: "ga"; gaId: string };

export function getAnalyticsConfig(): AnalyticsConfig {
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
  if (!enabled) {
    return { mode: "off" };
  }

  const mode = process.env.NEXT_PUBLIC_ANALYTICS_MODE;

  if (mode === "gtm") {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (!gtmId) {
      return { mode: "off" };
    }
    return { mode: "gtm", gtmId };
  }

  if (mode === "ga") {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!gaId) {
      return { mode: "off" };
    }
    return { mode: "ga", gaId };
  }

  return { mode: "off" };
}
