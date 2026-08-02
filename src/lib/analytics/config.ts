export type AnalyticsConfig =
  | { mode: "off" }
  | { mode: "gtm"; gtmId: string }
  | { mode: "ga"; gaId: string };

export function getAnalyticsConfig(): AnalyticsConfig {
  // NEXT_PUBLIC_VERCEL_ENV (not VERCEL_ENV) because this runs in client
  // components too, and only NEXT_PUBLIC_-prefixed vars are inlined into
  // the browser bundle. Vercel sets it automatically on its own infra,
  // never locally — so a local `next build && next start` can't
  // accidentally fire analytics no matter what .env.production says.
  const isProductionDeploy = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const enabled =
    isProductionDeploy && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
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
