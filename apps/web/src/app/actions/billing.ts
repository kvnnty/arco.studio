"use server";

import { requireAccessToken } from "@/lib/auth/session";
import {
  apiCreateBillingCheckout,
  apiCreateBillingPortal,
  apiGetBillingStatus,
  apiGetBillingUsage,
  type BillingInterval,
  type BillingStatus,
  type BillingUsage,
  type CheckoutPlan,
} from "@/lib/api/client";

export async function getBillingStatusAction(): Promise<BillingStatus> {
  const token = await requireAccessToken();
  return apiGetBillingStatus(token);
}

export async function getBillingUsageAction(): Promise<BillingUsage> {
  const token = await requireAccessToken();
  return apiGetBillingUsage(token);
}

export async function createCheckoutSessionAction(
  plan: CheckoutPlan,
  interval: BillingInterval = "monthly",
): Promise<{ url: string }> {
  const token = await requireAccessToken();
  return apiCreateBillingCheckout(token, plan, interval);
}

export async function createPortalSessionAction(): Promise<{ url: string }> {
  const token = await requireAccessToken();
  return apiCreateBillingPortal(token);
}
