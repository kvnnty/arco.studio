import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  monthlyIncludedCredits,
  topUpCreditsAmount,
  type ArcoPlan,
  type CreditActionType,
} from './plans';

export type CreditBalance = {
  includedCredits: number;
  purchasedCredits: number;
  reservedCredits: number;
  availableCredits: number;
  creditsPeriodStart: string | null;
  creditsPeriodEnd: string | null;
};

export type CreditLedgerItem = {
  id: string;
  kind: string;
  status: string;
  amount: number;
  balanceType: string | null;
  actionType: string | null;
  referenceType: string | null;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  settledAt: string | null;
  refundedAt: string | null;
};

type ReserveInput = {
  userId: string;
  amount: number;
  actionType: CreditActionType;
  referenceType: string;
  referenceId: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string): Promise<CreditBalance> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        includedCreditsBalance: true,
        purchasedCreditsBalance: true,
        reservedCreditsBalance: true,
        creditsPeriodStart: true,
        creditsPeriodEnd: true,
      },
    });

    const available =
      user.includedCreditsBalance +
      user.purchasedCreditsBalance -
      user.reservedCreditsBalance;

    return {
      includedCredits: user.includedCreditsBalance,
      purchasedCredits: user.purchasedCreditsBalance,
      reservedCredits: user.reservedCreditsBalance,
      availableCredits: Math.max(0, available),
      creditsPeriodStart: user.creditsPeriodStart?.toISOString() ?? null,
      creditsPeriodEnd: user.creditsPeriodEnd?.toISOString() ?? null,
    };
  }

  async getLedger(
    userId: string,
    limit = 50,
  ): Promise<CreditLedgerItem[]> {
    const entries = await this.prisma.creditLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      status: entry.status,
      amount: entry.amount,
      balanceType: entry.balanceType,
      actionType: entry.actionType,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      metadata: safeParseJson(entry.metadata),
      createdAt: entry.createdAt.toISOString(),
      settledAt: entry.settledAt?.toISOString() ?? null,
      refundedAt: entry.refundedAt?.toISOString() ?? null,
    }));
  }

  async assertSufficientCredits(userId: string, amount: number): Promise<void> {
    const balance = await this.getBalance(userId);
    if (balance.availableCredits < amount) {
      throw new HttpException(
        {
          error: 'insufficient_credits',
          code: 'insufficient_credits',
          message: `This action requires ${amount} credits. You have ${balance.availableCredits} available.`,
          requiredCredits: amount,
          availableCredits: balance.availableCredits,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async grantMonthlyCredits(
    userId: string,
    plan: ArcoPlan,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    const amount = monthlyIncludedCredits(plan);
    if (amount <= 0) return;

    const idempotencyKey = `monthly_grant:${userId}:${periodStart.toISOString()}`;

    const existing = await this.prisma.creditLedgerEntry.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.creditLedgerEntry.create({
        data: {
          userId,
          kind: 'monthly_grant',
          status: 'settled',
          amount,
          balanceType: 'included',
          idempotencyKey,
          metadata: JSON.stringify({ plan, periodStart, periodEnd }),
          settledAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          includedCreditsBalance: { increment: amount },
          creditsPeriodStart: periodStart,
          creditsPeriodEnd: periodEnd,
        },
      });
    });

    this.logger.log(
      `Granted ${amount} monthly credits to ${userId} for plan ${plan}`,
    );
  }

  async grantTopUpCredits(
    userId: string,
    orderId: string,
    amount = topUpCreditsAmount(),
  ): Promise<void> {
    const idempotencyKey = `top_up:${orderId}`;

    const existing = await this.prisma.creditLedgerEntry.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.creditLedgerEntry.create({
        data: {
          userId,
          kind: 'top_up',
          status: 'settled',
          amount,
          balanceType: 'purchased',
          idempotencyKey,
          referenceType: 'order',
          referenceId: orderId,
          metadata: JSON.stringify({ orderId }),
          settledAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { purchasedCreditsBalance: { increment: amount } },
      });
    });

    this.logger.log(`Granted ${amount} top-up credits to ${userId}`);
  }

  async grantReferralCredits(
    userId: string,
    referralId: string,
    amount: number,
  ): Promise<void> {
    const idempotencyKey = `referral_grant:${referralId}`;

    const existing = await this.prisma.creditLedgerEntry.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.creditLedgerEntry.create({
        data: {
          userId,
          kind: 'referral_grant',
          status: 'settled',
          amount,
          balanceType: 'purchased',
          idempotencyKey,
          referenceType: 'referral',
          referenceId: referralId,
          metadata: JSON.stringify({ referralId }),
          settledAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { purchasedCreditsBalance: { increment: amount } },
      });
    });
  }

  async seedInitialCreditsForActiveUser(
    userId: string,
    plan: ArcoPlan,
    periodEnd: Date | null,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        includedCreditsBalance: true,
        purchasedCreditsBalance: true,
        creditsPeriodStart: true,
      },
    });

    if (
      user.includedCreditsBalance > 0 ||
      user.purchasedCreditsBalance > 0 ||
      user.creditsPeriodStart
    ) {
      return;
    }

    const periodStart = new Date();
    const end =
      periodEnd ?? new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

    await this.grantMonthlyCredits(userId, plan, periodStart, end);
  }

  async reserveCredits(input: ReserveInput): Promise<{ id: string }> {
    const { userId, amount, actionType, referenceType, referenceId, metadata } =
      input;

    if (amount <= 0) {
      throw new HttpException('Invalid credit amount', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          includedCreditsBalance: true,
          purchasedCreditsBalance: true,
          reservedCreditsBalance: true,
        },
      });

      const available =
        user.includedCreditsBalance +
        user.purchasedCreditsBalance -
        user.reservedCreditsBalance;

      if (available < amount) {
        throw new HttpException(
          {
            error: 'insufficient_credits',
            code: 'insufficient_credits',
            message: `This action requires ${amount} credits. You have ${Math.max(0, available)} available.`,
            requiredCredits: amount,
            availableCredits: Math.max(0, available),
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      const reservation = await tx.creditLedgerEntry.create({
        data: {
          userId,
          kind: 'reservation',
          status: 'pending',
          amount,
          actionType,
          referenceType,
          referenceId,
          metadata: JSON.stringify(metadata ?? {}),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { reservedCreditsBalance: { increment: amount } },
      });

      return { id: reservation.id };
    });
  }

  async settleReservation(reservationId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.creditLedgerEntry.findUnique({
        where: { id: reservationId },
      });

      if (!reservation || reservation.kind !== 'reservation') {
        throw new NotFoundException('Credit reservation not found');
      }

      if (reservation.status === 'settled') return;
      if (reservation.status === 'refunded') {
        throw new HttpException(
          'Reservation already refunded',
          HttpStatus.CONFLICT,
        );
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id: reservation.userId },
        select: {
          includedCreditsBalance: true,
          purchasedCreditsBalance: true,
          reservedCreditsBalance: true,
        },
      });

      const amount = reservation.amount;
      const fromIncluded = Math.min(user.includedCreditsBalance, amount);
      const fromPurchased = amount - fromIncluded;

      await tx.user.update({
        where: { id: reservation.userId },
        data: {
          reservedCreditsBalance: { decrement: amount },
          includedCreditsBalance: { decrement: fromIncluded },
          purchasedCreditsBalance: { decrement: fromPurchased },
        },
      });

      await tx.creditLedgerEntry.update({
        where: { id: reservationId },
        data: {
          status: 'settled',
          settledAt: new Date(),
        },
      });

      await tx.creditLedgerEntry.create({
        data: {
          userId: reservation.userId,
          kind: 'settlement',
          status: 'settled',
          amount: -amount,
          balanceType:
            fromPurchased > 0 && fromIncluded > 0
              ? 'mixed'
              : fromPurchased > 0
                ? 'purchased'
                : 'included',
          actionType: reservation.actionType,
          referenceType: reservation.referenceType,
          referenceId: reservation.referenceId,
          parentReservationId: reservationId,
          metadata: JSON.stringify({
            fromIncluded,
            fromPurchased,
          }),
          settledAt: new Date(),
        },
      });

      await tx.usageEvent.create({
        data: {
          userId: reservation.userId,
          type: reservation.actionType ?? 'credit_spend',
          metadata: JSON.stringify({
            reservationId,
            amount,
            referenceType: reservation.referenceType,
            referenceId: reservation.referenceId,
          }),
        },
      });
    });
  }

  async refundReservation(
    reservationId: string,
    reason = 'action_failed',
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.creditLedgerEntry.findUnique({
        where: { id: reservationId },
      });

      if (!reservation || reservation.kind !== 'reservation') {
        throw new NotFoundException('Credit reservation not found');
      }

      if (reservation.status === 'refunded') return;
      if (reservation.status === 'settled') {
        throw new HttpException(
          'Cannot refund a settled reservation',
          HttpStatus.CONFLICT,
        );
      }

      await tx.user.update({
        where: { id: reservation.userId },
        data: {
          reservedCreditsBalance: { decrement: reservation.amount },
        },
      });

      await tx.creditLedgerEntry.update({
        where: { id: reservationId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          metadata: JSON.stringify({
            ...safeParseJson(reservation.metadata),
            refundReason: reason,
          }),
        },
      });

      await tx.creditLedgerEntry.create({
        data: {
          userId: reservation.userId,
          kind: 'refund',
          status: 'settled',
          amount: reservation.amount,
          actionType: reservation.actionType,
          referenceType: reservation.referenceType,
          referenceId: reservation.referenceId,
          parentReservationId: reservationId,
          metadata: JSON.stringify({ reason }),
          settledAt: new Date(),
        },
      });
    });
  }

  async updateReservationReference(
    reservationId: string,
    referenceId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const reservation = await this.prisma.creditLedgerEntry.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) return;

    await this.prisma.creditLedgerEntry.update({
      where: { id: reservationId },
      data: {
        referenceId,
        metadata: JSON.stringify({
          ...safeParseJson(reservation.metadata),
          ...(metadata ?? {}),
        }),
      },
    });
  }

  async withCreditReservation<T>(
    input: ReserveInput,
    fn: () => Promise<T>,
  ): Promise<T> {
    const reservation = await this.reserveCredits(input);
    try {
      const result = await fn();
      await this.settleReservation(reservation.id);
      return result;
    } catch (error) {
      await this.refundReservation(reservation.id).catch((refundError) => {
        this.logger.error(
          `Failed to refund reservation ${reservation.id}: ${
            refundError instanceof Error ? refundError.message : refundError
          }`,
        );
      });
      throw error;
    }
  }
}

function safeParseJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}
