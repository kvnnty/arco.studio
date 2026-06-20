"use client";

import { AppError } from "@/components/errors/error-boundary";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppError error={error} reset={reset} context="auth" />;
}
