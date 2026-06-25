export type ArcoPlan = 'trial' | 'pro' | 'studio';

export function parsePlan(plan: string | null | undefined): ArcoPlan | null {
  if (plan === 'trial' || plan === 'pro' || plan === 'studio') {
    return plan;
  }
  return null;
}

export function activeProjectLimit(plan: ArcoPlan | null): number {
  switch (plan) {
    case 'trial':
      return Number(process.env.ACTIVE_PROJECT_LIMIT_TRIAL ?? 5);
    case 'pro':
      return Number(process.env.ACTIVE_PROJECT_LIMIT_PRO ?? 15);
    case 'studio':
      return Number(process.env.ACTIVE_PROJECT_LIMIT_STUDIO ?? 9999);
    default:
      return 0;
  }
}

export function hasUnlimitedProjects(plan: ArcoPlan | null): boolean {
  return plan === 'studio';
}

export function canUseAspectFormat(
  plan: ArcoPlan | null,
  format: string,
): boolean {
  if (!plan) return false;
  if (plan === 'trial') return format === '16:9';
  return true;
}

export function canUse4k(plan: ArcoPlan | null): boolean {
  return plan === 'studio';
}

export function canUploadCustomMusic(
  plan: ArcoPlan | null,
  planStatus: string,
): boolean {
  return (
    planStatus === 'active' && (plan === 'pro' || plan === 'studio')
  );
}

export function canBatchSocialExport(plan: ArcoPlan | null): boolean {
  return plan === 'studio';
}

export function planLabel(plan: ArcoPlan | null): string {
  switch (plan) {
    case 'trial':
      return 'Intro';
    case 'pro':
      return 'Pro';
    case 'studio':
      return 'Studio';
    default:
      return 'None';
  }
}

export const SOCIAL_EXPORT_FORMATS = ['16:9', '1:1', '9:16'] as const;
