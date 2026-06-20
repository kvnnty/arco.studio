"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ALLOWED_PREFIXES = [
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/help",
];

type DashboardPaywallProps = {
  canUseProduct: boolean;
  children: React.ReactNode;
};

export function DashboardPaywall({
  canUseProduct,
  children,
}: DashboardPaywallProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAllowed = ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    if (!canUseProduct && !isAllowed) {
      router.replace("/dashboard/billing?welcome=1");
    }
  }, [canUseProduct, isAllowed, router]);

  if (!canUseProduct && !isAllowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to billing…
      </div>
    );
  }

  return children;
}
