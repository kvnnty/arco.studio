import { Suspense } from "react";

import { getBillingStatusAction } from "@/app/actions/billing";
import { BillingPageClient } from "@/components/dashboard/billing-page-client";

export default async function BillingPage() {
  const status = await getBillingStatusAction();

  return (
    <Suspense>
      <BillingPageClient status={status} />
    </Suspense>
  );
}
