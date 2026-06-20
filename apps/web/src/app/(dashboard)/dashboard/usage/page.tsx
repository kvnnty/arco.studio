import {
  getBillingStatusAction,
  getBillingUsageAction,
} from "@/app/actions/billing";
import { UsagePageClient } from "@/components/dashboard/usage-page-client";

export default async function UsagePage() {
  const [status, usage] = await Promise.all([
    getBillingStatusAction(),
    getBillingUsageAction(),
  ]);

  return <UsagePageClient status={status} counts={usage.counts} events={usage.events} />;
}
