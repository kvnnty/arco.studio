export type ArcoPlan = 'trial' | 'pro' | 'studio';

export type ExportQuality = '720p' | '1080p' | '4k';

export const EXPORT_QUALITIES: ExportQuality[] = ['720p', '1080p', '4k'];

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

export function allowedExportQualities(plan: ArcoPlan | null): ExportQuality[] {
  if (!plan) return [];
  switch (plan) {
    case 'trial':
      return ['720p'];
    case 'pro':
      return ['720p', '1080p'];
    case 'studio':
      return ['720p', '1080p', '4k'];
    default:
      return [];
  }
}

export function canUseExportQuality(
  plan: ArcoPlan | null,
  quality: string,
): boolean {
  if (!plan) return false;
  return allowedExportQualities(plan).includes(quality as ExportQuality);
}

export function canUploadCustomMusic(
  plan: ArcoPlan | null,
  planStatus: string,
): boolean {
  return (
    planStatus === 'active' && (plan === 'pro' || plan === 'studio')
  );
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

export function normalizeExportQuality(quality: string): ExportQuality {
  if (quality === '720p' || quality === '4k') return quality;
  return '1080p';
}

export function maxProjectDurationMs(plan: ArcoPlan | null): number {
  switch (plan) {
    case 'trial':
      return Number(process.env.MAX_DURATION_MS_TRIAL ?? 120_000);
    case 'pro':
      return Number(process.env.MAX_DURATION_MS_PRO ?? 300_000);
    case 'studio':
      return Number(process.env.MAX_DURATION_MS_STUDIO ?? 600_000);
    default:
      return 0;
  }
}

export function canUseProjectDuration(
  plan: ArcoPlan | null,
  durationMs: number,
): boolean {
  if (!plan || durationMs <= 0) return false;
  return durationMs <= maxProjectDurationMs(plan);
}
