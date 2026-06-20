"use client";

import { AppError } from "@/components/errors/error-boundary";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <AppError error={error} reset={reset} context="marketing" />
    </div>
  );
}
