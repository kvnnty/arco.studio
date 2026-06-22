"use client";

import { Suspense } from "react";

import { EditorPaywall } from "@/components/dashboard/editor-paywall";
import { EditorPage } from "@/components/editor/editor-page";
import { useBillingStatus } from "@/lib/api/hooks/billing";

function EditorRouteContent() {
  const { data: billing } = useBillingStatus();

  return (
    <EditorPaywall canUseProduct={billing?.canUseProduct ?? false}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <EditorPage />
      </Suspense>
    </EditorPaywall>
  );
}

export function EditorRouteClient() {
  return <EditorRouteContent />;
}
