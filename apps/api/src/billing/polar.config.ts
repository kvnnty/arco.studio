import type { ArcoPlan } from './plans';

export type BillingInterval = 'monthly' | 'annual';

export type PolarServer = 'production' | 'sandbox';

const REQUIRED_PRODUCT_KEYS = [
  'POLAR_PRODUCT_TRIAL_MONTHLY',
  'POLAR_PRODUCT_PRO_MONTHLY',
  'POLAR_PRODUCT_PRO_ANNUAL',
  'POLAR_PRODUCT_STUDIO_MONTHLY',
  'POLAR_PRODUCT_STUDIO_ANNUAL',
] as const;

export function polarServer(): PolarServer {
  return process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production';
}

export function polarAccessToken(): string | undefined {
  return process.env.POLAR_ACCESS_TOKEN?.trim() || undefined;
}

export function polarWebhookSecret(): string | undefined {
  return process.env.POLAR_WEBHOOK_SECRET?.trim() || undefined;
}

export function polarCheckoutUrls() {
  return {
    successUrl:
      process.env.POLAR_SUCCESS_URL ??
      'http://localhost:3000/dashboard/billing?checkout=success',
    returnUrl:
      process.env.POLAR_RETURN_URL ??
      'http://localhost:3000/dashboard/billing?checkout=canceled',
    portalReturnUrl:
      process.env.POLAR_PORTAL_RETURN_URL ??
      'http://localhost:3000/dashboard/billing',
  };
}

export function validatePolarBillingConfig(): string[] {
  const missing: string[] = [];

  if (!polarAccessToken()) {
    missing.push('POLAR_ACCESS_TOKEN');
  }
  if (!polarWebhookSecret()) {
    missing.push('POLAR_WEBHOOK_SECRET');
  }

  for (const key of REQUIRED_PRODUCT_KEYS) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }

  return missing;
}

export function polarBillingConfigured(): boolean {
  return validatePolarBillingConfig().length === 0;
}

export function polarProductIds(): Record<
  ArcoPlan,
  { monthly: string; annual?: string }
> {
  return {
    trial: {
      monthly: process.env.POLAR_PRODUCT_TRIAL_MONTHLY!.trim(),
    },
    pro: {
      monthly: process.env.POLAR_PRODUCT_PRO_MONTHLY!.trim(),
      annual: process.env.POLAR_PRODUCT_PRO_ANNUAL!.trim(),
    },
    studio: {
      monthly: process.env.POLAR_PRODUCT_STUDIO_MONTHLY!.trim(),
      annual: process.env.POLAR_PRODUCT_STUDIO_ANNUAL!.trim(),
    },
  };
}

export function resolvePolarProductId(
  plan: ArcoPlan,
  interval: BillingInterval = 'annual',
): string {
  const products = polarProductIds();
  const entry = products[plan];
  const productId =
    interval === 'annual' && entry.annual ? entry.annual : entry.monthly;

  if (!productId) {
    const envKey =
      interval === 'annual'
        ? `POLAR_PRODUCT_${plan.toUpperCase()}_ANNUAL`
        : `POLAR_PRODUCT_${plan.toUpperCase()}_MONTHLY`;
    throw new Error(`${envKey} is not configured.`);
  }

  return productId;
}

export function polarTopUpProductId(): string | undefined {
  return process.env.POLAR_PRODUCT_TOPUP?.trim() || undefined;
}

export function resolvePlanFromProductId(productId: string): ArcoPlan | null {
  const trial = process.env.POLAR_PRODUCT_TRIAL_MONTHLY?.trim();
  if (productId === trial) return 'trial';

  const proMonthly = process.env.POLAR_PRODUCT_PRO_MONTHLY?.trim();
  const proAnnual = process.env.POLAR_PRODUCT_PRO_ANNUAL?.trim();
  if (productId === proMonthly || productId === proAnnual) return 'pro';

  const studioMonthly = process.env.POLAR_PRODUCT_STUDIO_MONTHLY?.trim();
  const studioAnnual = process.env.POLAR_PRODUCT_STUDIO_ANNUAL?.trim();
  if (productId === studioMonthly || productId === studioAnnual)
    return 'studio';

  return null;
}

export function isTopUpProductId(productId: string): boolean {
  const topUp = polarTopUpProductId();
  return !!topUp && productId === topUp;
}

export function planRank(plan: ArcoPlan): number {
  switch (plan) {
    case 'trial':
      return 1;
    case 'pro':
      return 2;
    case 'studio':
      return 3;
    default:
      return 0;
  }
}
