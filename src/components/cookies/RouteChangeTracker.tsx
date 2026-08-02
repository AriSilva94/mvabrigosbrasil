"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendGAEvent, sendGTMEvent } from "@next/third-parties/google";
import type { AnalyticsConfig } from "@/lib/analytics/config";

type Props = {
  config: AnalyticsConfig;
};

export default function RouteChangeTracker({ config }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (config.mode === "gtm") {
      sendGTMEvent({ event: "page_view", page_path: pagePath });
    } else if (config.mode === "ga") {
      sendGAEvent("event", "page_view", { page_path: pagePath });
    }
  }, [pathname, searchParams, config]);

  return null;
}
