"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullPageSkeleton } from "@/components/dashboard/page-skeletons";
import { Button } from "@/components/ui/button";

type EditorPaywallProps = {
  canUseProduct: boolean;
  /** True while auth/billing status is still resolving — do not treat as unpaid. */
  billingLoading: boolean;
  /** True when the billing status request failed — do not treat as unpaid. */
  billingError?: boolean;
  children: React.ReactNode;
};

export function EditorPaywall({
  canUseProduct,
  billingLoading,
  billingError = false,
  children,
}: EditorPaywallProps) {
  const router = useRouter();

  useEffect(() => {
    if (billingLoading || billingError) return;
    if (!canUseProduct) {
      router.replace("/dashboard/billing?welcome=1");
    }
  }, [billingLoading, billingError, canUseProduct, router]);

  if (billingLoading) {
    return <FullPageSkeleton />;
  }

  if (billingError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Could not verify subscription…
      </div>
    );
  }

  if (!canUseProduct) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Subscribe to use the editor and export videos.
        </p>
        <Button onClick={() => router.push("/dashboard/billing?welcome=1")}>
          Choose a plan
        </Button>
      </div>
    );
  }

  return children;
}
