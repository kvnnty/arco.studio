import { Suspense } from "react";

import { BillingPageClient } from "@/components/dashboard/billing-page-client";
import { BillingPageSkeleton } from "@/components/dashboard/page-skeletons";

export const metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingPageSkeleton />}>
      <BillingPageClient />
    </Suspense>
  );
}
