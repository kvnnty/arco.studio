"use server";

import { getAccessToken } from "@/lib/auth/session";
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

async function requireToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return token;
}

export async function getBillingStatusAction(): Promise<BillingStatus> {
  const token = await requireToken();
  return apiGetBillingStatus(token);
}

export async function getBillingUsageAction(): Promise<BillingUsage> {
  const token = await requireToken();
  return apiGetBillingUsage(token);
}

export async function createCheckoutSessionAction(
  plan: CheckoutPlan,
  interval: BillingInterval = "monthly",
): Promise<{ url: string }> {
  const token = await requireToken();
  return apiCreateBillingCheckout(token, plan, interval);
}

export async function createPortalSessionAction(): Promise<{ url: string }> {
  const token = await requireToken();
  return apiCreateBillingPortal(token);
}
