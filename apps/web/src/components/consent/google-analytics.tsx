"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalyticsLoader() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaId) return;
    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
    });
  }, [gaId]);

  if (!gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
