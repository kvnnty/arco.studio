"use client";

import { Suspense } from "react";

import { EditorPaywall } from "@/components/dashboard/editor-paywall";
import { FullPageSkeleton } from "@/components/dashboard/page-skeletons";
import { EditorPage } from "@/components/editor/editor-page";
import { useBillingStatus } from "@/lib/api/hooks/billing";

function EditorRouteContent() {
  const {
    data: billing,
    isLoading: billingLoading,
    isError: billingError,
  } = useBillingStatus();

  return (
    <EditorPaywall
      canUseProduct={billing?.canUseProduct ?? false}
      billingLoading={billingLoading}
      billingError={billingError}
    >
      <Suspense fallback={<FullPageSkeleton />}>
        <EditorPage />
      </Suspense>
    </EditorPaywall>
  );
}

export function EditorRouteClient() {
  return <EditorRouteContent />;
}
