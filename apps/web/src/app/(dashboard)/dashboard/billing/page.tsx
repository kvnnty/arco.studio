import { Suspense } from "react";

import { BillingPageClient } from "@/components/dashboard/billing-page-client";

export default function BillingPage() {
  return (
    <Suspense>
      <BillingPageClient />
    </Suspense>
  );
}
