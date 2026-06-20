"use client";

import { useEffect } from "react";

import { sentryBeforeSend } from "@/lib/consent/sentry-scrub";

export function SentryClientLoader() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  useEffect(() => {
    if (!dsn) return;

    void import("@sentry/nextjs").then((Sentry) => {
      if (Sentry.getClient()) return;

      Sentry.init({
        dsn,
        enabled: true,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeSend: sentryBeforeSend,
      });
    });
  }, [dsn]);

  return null;
}
