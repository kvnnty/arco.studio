import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service.js';

export type BillingStatus = {
  planStatus: string;
  plan: string | null;
  exportAllowance: number;
  exportsUsedThisPeriod: number;
  exportsRemaining: number;
  periodEnd: string | null;
  hadLaunchOffer: boolean;
  canUseProduct: boolean;
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (secret) {
      this.stripe = new Stripe(secret);
    }
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Billing is not configured. Set STRIPE_SECRET_KEY.',
      );
    }
    return this.stripe;
  }

  async getStatus(userId: string): Promise<BillingStatus> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const exportsRemaining = Math.max(
      0,
      user.exportAllowance - user.exportsUsedThisPeriod,
    );

    return {
      planStatus: user.planStatus,
      plan: user.plan,
      exportAllowance: user.exportAllowance,
      exportsUsedThisPeriod: user.exportsUsedThisPeriod,
      exportsRemaining,
      periodEnd: user.periodEnd?.toISOString() ?? null,
      hadLaunchOffer: user.hadLaunchOffer,
      canUseProduct: user.planStatus === 'active',
    };
  }

  async assertActive(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.planStatus !== 'active') {
      throw new HttpException(
        'An active subscription is required. Start the Launch Offer to continue.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async assertCanExport(userId: string): Promise<void> {
    await this.assertActive(userId);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.exportsUsedThisPeriod >= user.exportAllowance) {
      throw new HttpException(
        'You have used all exports for this billing period. Manage your plan or wait for renewal.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async reserveExport(userId: string, renderJobId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { exportsUsedThisPeriod: { increment: 1 } },
      }),
      this.prisma.usageEvent.create({
        data: {
          userId,
          type: 'export',
          metadata: JSON.stringify({ renderJobId }),
        },
      }),
    ]);
  }

  async refundExport(userId: string, renderJobId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.exportsUsedThisPeriod <= 0) return;

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { exportsUsedThisPeriod: { decrement: 1 } },
      }),
      this.prisma.usageEvent.create({
        data: {
          userId,
          type: 'export_refund',
          metadata: JSON.stringify({ renderJobId }),
        },
      }),
    ]);
  }

  async recordAiUsage(userId: string, type: string, metadata?: object): Promise<void> {
    await this.prisma.usageEvent.create({
      data: {
        userId,
        type,
        metadata: JSON.stringify(metadata ?? {}),
      },
    });
  }

  async getUsageBreakdown(userId: string) {
    const since = new Date();
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const events = await this.prisma.usageEvent.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });

    const counts: Record<string, number> = {};
    for (const event of events) {
      if (event.type === 'export_refund') continue;
      counts[event.type] = (counts[event.type] ?? 0) + 1;
    }

    return { events, counts };
  }

  async createCheckoutSession(userId: string, email: string): Promise<{ url: string }> {
    const stripe = this.requireStripe();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.planStatus === 'active') {
      throw new BadRequestException('You already have an active subscription.');
    }

    const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    if (!priceId) {
      throw new ServiceUnavailableException('STRIPE_PRICE_PRO_MONTHLY is not configured.');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ??
      'http://localhost:3000/dashboard/billing?checkout=success';
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL ??
      'http://localhost:3000/dashboard/billing?checkout=canceled';

    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    const launchCoupon = process.env.STRIPE_COUPON_LAUNCH;
    if (launchCoupon && !user.hadLaunchOffer) {
      discounts.push({ coupon: launchCoupon });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: discounts.length > 0 ? discounts : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
    });

    if (!session.url) {
      throw new BadRequestException('Could not create checkout session.');
    }

    return { url: session.url };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const stripe = this.requireStripe();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.stripeCustomerId) {
      throw new BadRequestException('No billing account found.');
    }

    const returnUrl =
      process.env.STRIPE_PORTAL_RETURN_URL ??
      'http://localhost:3000/dashboard/billing';

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = this.requireStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET is not configured.');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      this.logger.warn(
        `Webhook signature verification failed: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await this.onInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.onPaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    const hadDiscount = (session.total_details?.amount_discount ?? 0) > 0;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planStatus: 'active',
        plan: 'pro',
        stripeSubscriptionId: subscriptionId ?? undefined,
        exportAllowance: Number(process.env.EXPORT_ALLOWANCE_PRO ?? 15),
        exportsUsedThisPeriod: 0,
        ...(hadDiscount ? { hadLaunchOffer: true } : {}),
      },
    });
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;
      const user = await this.prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (!user) return;
      await this.syncSubscription(user.id, subscription);
      return;
    }

    await this.syncSubscription(userId, subscription);
  }

  private async syncSubscription(userId: string, subscription: Stripe.Subscription) {
    const status = subscription.status;
    let planStatus = 'inactive';

    if (status === 'active' || status === 'trialing') {
      planStatus = 'active';
    } else if (status === 'past_due' || status === 'unpaid') {
      planStatus = 'past_due';
    } else if (status === 'canceled') {
      planStatus = 'canceled';
    }

    const periodEndUnix =
      subscription.items.data[0]?.current_period_end ??
      (subscription as Stripe.Subscription & { current_period_end?: number })
        .current_period_end;
    const periodEnd = periodEndUnix
      ? new Date(periodEndUnix * 1000)
      : undefined;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planStatus,
        plan: planStatus === 'active' ? 'pro' : null,
        stripeSubscriptionId: subscription.id,
        periodEnd,
      },
    });
  }

  private async onInvoicePaid(invoice: Stripe.Invoice) {
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;
    if (!customerId) return;

    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!user) return;

    if (invoice.billing_reason === 'subscription_cycle') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          exportsUsedThisPeriod: 0,
          planStatus: 'active',
        },
      });
    }
  }

  private async onPaymentFailed(invoice: Stripe.Invoice) {
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;
    if (!customerId) return;

    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!user) return;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { planStatus: 'past_due' },
    });
  }
}
