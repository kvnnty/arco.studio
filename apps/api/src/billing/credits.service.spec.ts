import { HttpException } from '@nestjs/common';
import { CreditsService } from './credits.service';

type UserBalances = {
  includedCreditsBalance: number;
  purchasedCreditsBalance: number;
  reservedCreditsBalance: number;
  creditsPeriodStart: Date | null;
  creditsPeriodEnd: Date | null;
};

function createMockPrisma(initial: UserBalances) {
  const user = { ...initial };
  const entries: Array<Record<string, unknown>> = [];
  const usageEvents: Array<Record<string, unknown>> = [];
  let entryCounter = 0;

  const prisma = {
    user: {
      findUniqueOrThrow: jest.fn(async () => ({ ...user })),
      update: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        for (const [key, value] of Object.entries(data)) {
          if (
            typeof value === 'object' &&
            value !== null &&
            'increment' in value
          ) {
            user[key as keyof UserBalances] =
              (user[key as keyof UserBalances] as number) +
              (value.increment as number);
          } else if (
            typeof value === 'object' &&
            value !== null &&
            'decrement' in value
          ) {
            user[key as keyof UserBalances] =
              (user[key as keyof UserBalances] as number) -
              (value.decrement as number);
          } else {
            user[key as keyof UserBalances] = value as never;
          }
        }
        return { ...user };
      }),
    },
    creditLedgerEntry: {
      findUnique: jest.fn(async ({ where }: { where: { id?: string; idempotencyKey?: string } }) => {
        return (
          entries.find(
            (entry) =>
              (where.id && entry.id === where.id) ||
              (where.idempotencyKey &&
                entry.idempotencyKey === where.idempotencyKey),
          ) ?? null
        );
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        entryCounter += 1;
        const entry = {
          id: `entry-${entryCounter}`,
          status: data.status ?? 'pending',
          kind: data.kind,
          amount: data.amount,
          actionType: data.actionType,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          metadata: data.metadata ?? '{}',
          userId: data.userId,
          idempotencyKey: data.idempotencyKey,
        };
        entries.push(entry);
        return entry;
      }),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Record<string, unknown>;
        }) => {
          const entry = entries.find((item) => item.id === where.id);
          if (!entry) throw new Error('not found');
          Object.assign(entry, data);
          return entry;
        },
      ),
      findMany: jest.fn(async () => [...entries].reverse()),
    },
    usageEvent: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        usageEvents.push(data);
        return data;
      }),
    },
    $transaction: jest.fn(async (callback: (tx: typeof prisma) => Promise<unknown>) => {
      return callback(prisma);
    }),
  };

  return { prisma, user, entries, usageEvents };
}

describe('CreditsService', () => {
  it('grants monthly credits idempotently', async () => {
    const { prisma } = createMockPrisma({
      includedCreditsBalance: 0,
      purchasedCreditsBalance: 0,
      reservedCreditsBalance: 0,
      creditsPeriodStart: null,
      creditsPeriodEnd: null,
    });
    const service = new CreditsService(prisma as never);
    const periodStart = new Date('2026-07-01T00:00:00.000Z');
    const periodEnd = new Date('2026-08-01T00:00:00.000Z');

    await service.grantMonthlyCredits('user-1', 'pro', periodStart, periodEnd);
    await service.grantMonthlyCredits('user-1', 'pro', periodStart, periodEnd);

    const balance = await service.getBalance('user-1');
    expect(balance.includedCredits).toBe(1250);
  });

  it('reserves, settles, and deducts included credits first', async () => {
    const { prisma, user } = createMockPrisma({
      includedCreditsBalance: 100,
      purchasedCreditsBalance: 50,
      reservedCreditsBalance: 0,
      creditsPeriodStart: null,
      creditsPeriodEnd: null,
    });
    const service = new CreditsService(prisma as never);

    const reservation = await service.reserveCredits({
      userId: 'user-1',
      amount: 30,
      actionType: 'ai_draft',
      referenceType: 'ai_request',
      referenceId: 'req-1',
    });

    expect(user.reservedCreditsBalance).toBe(30);

    await service.settleReservation(reservation.id);

    expect(user.reservedCreditsBalance).toBe(0);
    expect(user.includedCreditsBalance).toBe(70);
    expect(user.purchasedCreditsBalance).toBe(50);
  });

  it('refunds a pending reservation without spending balances', async () => {
    const { prisma, user } = createMockPrisma({
      includedCreditsBalance: 100,
      purchasedCreditsBalance: 0,
      reservedCreditsBalance: 0,
      creditsPeriodStart: null,
      creditsPeriodEnd: null,
    });
    const service = new CreditsService(prisma as never);

    const reservation = await service.reserveCredits({
      userId: 'user-1',
      amount: 25,
      actionType: 'ai_draft',
      referenceType: 'ai_request',
      referenceId: 'req-2',
    });

    await service.refundReservation(reservation.id, 'failed');

    expect(user.reservedCreditsBalance).toBe(0);
    expect(user.includedCreditsBalance).toBe(100);
  });

  it('throws when insufficient credits are available', async () => {
    const { prisma } = createMockPrisma({
      includedCreditsBalance: 10,
      purchasedCreditsBalance: 0,
      reservedCreditsBalance: 0,
      creditsPeriodStart: null,
      creditsPeriodEnd: null,
    });
    const service = new CreditsService(prisma as never);

    await expect(
      service.reserveCredits({
        userId: 'user-1',
        amount: 25,
        actionType: 'export_1080p',
        referenceType: 'render_job',
        referenceId: 'job-1',
      }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('refunds wrapped actions when work fails', async () => {
    const { prisma, user } = createMockPrisma({
      includedCreditsBalance: 100,
      purchasedCreditsBalance: 0,
      reservedCreditsBalance: 0,
      creditsPeriodStart: null,
      creditsPeriodEnd: null,
    });
    const service = new CreditsService(prisma as never);

    await expect(
      service.withCreditReservation(
        {
          userId: 'user-1',
          amount: 5,
          actionType: 'ai_chat',
          referenceType: 'ai_request',
          referenceId: 'req-3',
        },
        async () => {
          throw new Error('boom');
        },
      ),
    ).rejects.toThrow('boom');

    expect(user.reservedCreditsBalance).toBe(0);
    expect(user.includedCreditsBalance).toBe(100);
  });
});
