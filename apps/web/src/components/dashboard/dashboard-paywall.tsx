"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { InlineContentSkeleton } from "@/components/dashboard/page-skeletons";

const ALLOWED_PREFIXES = [
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/help",
];

type DashboardPaywallProps = {
  canUseProduct: boolean;
  /** True while auth/billing status is still resolving — do not treat as unpaid. */
  billingLoading: boolean;
  /** True when the billing status request failed — do not treat as unpaid. */
  billingError: boolean;
  children: React.ReactNode;
};

export function DashboardPaywall({
  canUseProduct,
  billingLoading,
  billingError,
  children,
}: DashboardPaywallProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAllowed = ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    if (billingLoading || billingError) return;
    if (!canUseProduct && !isAllowed) {
      router.replace("/dashboard/billing?welcome=1");
    }
  }, [billingLoading, billingError, canUseProduct, isAllowed, router]);

  if ((billingLoading || billingError) && !isAllowed) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6">
        {billingError ? (
          <>
            <p className="text-sm text-muted-foreground">
              Could not verify subscription.
            </p>
            <button
              type="button"
              className="text-sm text-foreground underline underline-offset-4"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
          </>
        ) : (
          <InlineContentSkeleton className="w-full max-w-sm" lines={4} />
        )}
      </div>
    );
  }

  if (!canUseProduct && !isAllowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <InlineContentSkeleton className="w-full max-w-sm" lines={3} />
      </div>
    );
  }

  return children;
}
