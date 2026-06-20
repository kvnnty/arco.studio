"use client";

import { AppError } from "@/components/errors/error-boundary";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppError error={error} reset={reset} context="dashboard" />;
}
