"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/errors/error-page";

export type ErrorContext = "root" | "marketing" | "dashboard" | "auth";

const homeByContext: Record<ErrorContext, { href: string; label: string }> = {
  root: { href: "/", label: "Back to home" },
  marketing: { href: "/", label: "Back to home" },
  dashboard: { href: "/dashboard", label: "Go to dashboard" },
  auth: { href: "/", label: "Back to home" },
};

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  context?: ErrorContext;
};

export function AppError({ error, reset, context = "root" }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const home = homeByContext[context];
  const variant = context === "root" ? "full" : "inset";

  return (
    <ErrorPage
      variant={variant}
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. Try again, or head back home if the problem persists."
      primaryAction={{
        label: "Try again",
        onClick: reset,
      }}
      secondaryAction={home}
    />
  );
}

export function NotFoundContent({ context = "root" }: { context?: ErrorContext }) {
  const home = homeByContext[context];
  const variant = context === "root" ? "full" : "inset";

  return (
    <ErrorPage
      variant={variant}
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      primaryAction={home}
      secondaryAction={{
        label: "View docs",
        href: "/docs",
      }}
    />
  );
}
