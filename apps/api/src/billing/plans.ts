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

export type CreditActionType =
  | 'ai_draft'
  | 'ai_storyboard'
  | 'ai_chat'
  | 'ai_refine'
  | 'ai_regenerate'
  | 'voice_generate'
  | 'voice_preview'
  | 'export_720p'
  | 'export_1080p'
  | 'export_4k';

export function monthlyIncludedCredits(plan: ArcoPlan | null): number {
  switch (plan) {
    case 'trial':
      return Number(process.env.MONTHLY_CREDITS_TRIAL ?? 200);
    case 'pro':
      return Number(process.env.MONTHLY_CREDITS_PRO ?? 1250);
    case 'studio':
      return Number(process.env.MONTHLY_CREDITS_STUDIO ?? 3000);
    default:
      return 0;
  }
}

export function topUpCreditsAmount(): number {
  return Number(process.env.TOPUP_CREDITS_AMOUNT ?? 200);
}

const CREDIT_COSTS: Record<CreditActionType, number> = {
  ai_draft: Number(process.env.CREDIT_COST_AI_DRAFT ?? 25),
  ai_storyboard: Number(process.env.CREDIT_COST_AI_STORYBOARD ?? 30),
  ai_chat: Number(process.env.CREDIT_COST_AI_CHAT ?? 5),
  ai_refine: Number(process.env.CREDIT_COST_AI_REFINE ?? 10),
  ai_regenerate: Number(process.env.CREDIT_COST_AI_REGENERATE ?? 8),
  voice_generate: Number(process.env.CREDIT_COST_VOICE_GENERATE ?? 40),
  voice_preview: Number(process.env.CREDIT_COST_VOICE_PREVIEW ?? 5),
  // Exports are included with the plan (quality gated). Charge AI/voice only.
  export_720p: Number(process.env.CREDIT_COST_EXPORT_720P ?? 0),
  export_1080p: Number(process.env.CREDIT_COST_EXPORT_1080P ?? 0),
  export_4k: Number(process.env.CREDIT_COST_EXPORT_4K ?? 0),
};

export function creditCostForAction(action: CreditActionType): number {
  return CREDIT_COSTS[action] ?? 0;
}

export function creditCostForExport(quality: string): number {
  const normalized = normalizeExportQuality(quality);
  if (normalized === '720p') return creditCostForAction('export_720p');
  if (normalized === '4k') return creditCostForAction('export_4k');
  return creditCostForAction('export_1080p');
}

export function creditCostForVoiceGenerate(sceneCount: number): number {
  const perScene = creditCostForAction('voice_generate');
  return Math.max(perScene, perScene * Math.max(1, sceneCount));
}
