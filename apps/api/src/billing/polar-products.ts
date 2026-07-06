import type { ArcoPlan } from './plans.js';

export type BillingInterval = 'monthly' | 'annual';

const PRODUCT_ENV_KEYS: Record<
  ArcoPlan,
  { monthly: string; annual?: string }
> = {
  trial: {
    monthly: 'POLAR_PRODUCT_TRIAL_MONTHLY',
  },
  pro: {
    monthly: 'POLAR_PRODUCT_PRO_MONTHLY',
    annual: 'POLAR_PRODUCT_PRO_ANNUAL',
  },
  studio: {
    monthly: 'POLAR_PRODUCT_STUDIO_MONTHLY',
    annual: 'POLAR_PRODUCT_STUDIO_ANNUAL',
  },
};

export function resolvePolarProductId(
  plan: ArcoPlan,
  interval: BillingInterval = 'monthly',
): string {
  const keys = PRODUCT_ENV_KEYS[plan];
  const envKey =
    interval === 'annual' && keys.annual ? keys.annual : keys.monthly;
  const productId = process.env[envKey];

  if (!productId) {
    throw new Error(`${envKey} is not configured.`);
  }

  return productId;
}

export function resolvePlanFromProductId(productId: string): ArcoPlan | null {
  for (const plan of ['trial', 'pro', 'studio'] as const) {
    const keys = PRODUCT_ENV_KEYS[plan];
    const monthly = process.env[keys.monthly];
    if (productId === monthly) {
      return plan;
    }
    if (keys.annual) {
      const annual = process.env[keys.annual];
      if (productId === annual) {
        return plan;
      }
    }
  }
  return null;
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
