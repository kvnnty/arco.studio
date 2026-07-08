import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const REFERRAL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export type ReferralInvite = {
  id: string;
  email: string;
  status: 'pending' | 'rewarded';
  creditsAwarded: number;
  createdAt: string;
  rewardedAt: string | null;
};

export type ReferralSummary = {
  code: string;
  link: string;
  creditsPerReferral: number;
  stats: {
    pending: number;
    rewarded: number;
    creditsEarned: number;
  };
  invites: ReferralInvite[];
};

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private readonly prisma: PrismaService) {}

  get creditsPerReferral(): number {
    return Number(process.env.REFERRAL_CREDITS_PER_SIGNUP ?? 5);
  }

  private get webAppUrl(): string {
    return process.env.WEB_APP_URL ?? 'http://localhost:3000';
  }

  async getSummary(userId: string): Promise<ReferralSummary> {
    const code = await this.ensureReferralCode(userId);

    const referrals = await this.prisma.referral.findMany({
      where: { referrerUserId: userId },
      include: {
        referred: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let pending = 0;
    let rewarded = 0;
    let creditsEarned = 0;

    const invites: ReferralInvite[] = referrals.map((referral) => {
      if (referral.status === 'rewarded') {
        rewarded += 1;
        creditsEarned += referral.creditsAwarded;
      } else {
        pending += 1;
      }

      return {
        id: referral.id,
        email: maskEmail(referral.referred.email),
        status: referral.status as 'pending' | 'rewarded',
        creditsAwarded: referral.creditsAwarded,
        createdAt: referral.createdAt.toISOString(),
        rewardedAt: referral.rewardedAt?.toISOString() ?? null,
      };
    });

    return {
      code,
      link: `${this.webAppUrl.replace(/\/$/, '')}/signup?ref=${code}`,
      creditsPerReferral: this.creditsPerReferral,
      stats: { pending, rewarded, creditsEarned },
      invites,
    };
  }

  async ensureReferralCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (user.referralCode) {
      return user.referralCode;
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = this.generateReferralCode();
      try {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
          select: { referralCode: true },
        });
        return updated.referralCode!;
      } catch {
        // Unique constraint collision — retry.
      }
    }

    throw new Error('Could not generate a unique referral code.');
  }

  async attachReferral(
    referredUserId: string,
    referralCode?: string | null,
  ): Promise<void> {
    const normalized = referralCode?.trim().toUpperCase();
    if (!normalized) return;

    const referred = await this.prisma.user.findUnique({
      where: { id: referredUserId },
      select: {
        id: true,
        referredByUserId: true,
        referralsReceived: { select: { id: true } },
      },
    });

    if (!referred || referred.referredByUserId || referred.referralsReceived) {
      return;
    }

    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: normalized },
      select: { id: true },
    });

    if (!referrer || referrer.id === referredUserId) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: referredUserId },
        data: { referredByUserId: referrer.id },
      }),
      this.prisma.referral.create({
        data: {
          referrerUserId: referrer.id,
          referredUserId,
          status: 'pending',
        },
      }),
    ]);
  }

  async rewardReferrer(referredUserId: string): Promise<void> {
    const referral = await this.prisma.referral.findUnique({
      where: { referredUserId },
      include: {
        referrer: { select: { id: true } },
      },
    });

    if (!referral || referral.status === 'rewarded') {
      return;
    }

    const credits = this.creditsPerReferral;
    if (credits <= 0) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: 'rewarded',
          creditsAwarded: credits,
          rewardedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: referral.referrerUserId },
        data: { extraProjectSlots: { increment: credits } },
      }),
      this.prisma.usageEvent.create({
        data: {
          userId: referral.referrerUserId,
          type: 'referral_reward',
          metadata: JSON.stringify({
            referredUserId,
            credits,
          }),
        },
      }),
    ]);

    this.logger.log(
      `Awarded ${credits} bonus project slots to referrer ${referral.referrerUserId} for referral ${referral.id}`,
    );
  }

  private generateReferralCode(): string {
    const bytes = randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i += 1) {
      code += REFERRAL_CODE_CHARS[bytes[i]! % REFERRAL_CODE_CHARS.length];
    }
    return code;
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}
