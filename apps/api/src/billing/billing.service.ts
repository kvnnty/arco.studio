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
import { ReferralsService } from '../referrals/referrals.service.js';
import {
  activeProjectLimit,
  canBatchSocialExport,
  canUploadCustomMusic,
  canUse4k,
  canUseAspectFormat,
  hasUnlimitedProjects,
  parsePlan,
  type ArcoPlan,
} from './plans.js';

export type BillingStatus = {
  planStatus: string;
  plan: string | null;
  activeProjectCount: number;
  activeProjectLimit: number;
  activeProjectsRemaining: number;
  hasUnlimitedProjects: boolean;
  periodEnd: string | null;
  hadLaunchOffer: boolean;
  canUseProduct: boolean;
  canUploadCustomMusic: boolean;
  canExport4k: boolean;
  canExportAllFormats: boolean;
  canBatchSocialExport: boolean;
};

export type CheckoutPlan = ArcoPlan;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralsService,
  ) {
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

  private async getUserPlanContext(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const plan = parsePlan(user.plan);
    const limit = activeProjectLimit(plan) + user.extraProjectSlots;
    const activeProjectCount = await this.prisma.project.count({
      where: { userId },
    });

    return { user, plan, limit, activeProjectCount };
  }

  async getStatus(userId: string): Promise<BillingStatus> {
    const { user, plan, limit, activeProjectCount } =
      await this.getUserPlanContext(userId);

    const activeProjectsRemaining = Math.max(0, limit - activeProjectCount);

    return {
      planStatus: user.planStatus,
      plan: user.plan,
      activeProjectCount,
      activeProjectLimit: limit,
      activeProjectsRemaining,
      hasUnlimitedProjects: hasUnlimitedProjects(plan),
      periodEnd: user.periodEnd?.toISOString() ?? null,
      hadLaunchOffer: user.hadLaunchOffer,
      canUseProduct: user.planStatus === 'active',
      canUploadCustomMusic: canUploadCustomMusic(plan, user.planStatus),
      canExport4k: user.planStatus === 'active' && canUse4k(plan),
      canExportAllFormats:
        user.planStatus === 'active' && plan !== null && plan !== 'trial',
      canBatchSocialExport:
        user.planStatus === 'active' && canBatchSocialExport(plan),
    };
  }

  async assertProPlan(userId: string): Promise<void> {
    const { user, plan } = await this.getUserPlanContext(userId);

    if (!canUploadCustomMusic(plan, user.planStatus)) {
      throw new HttpException(
        'Custom music upload requires Pro ($29/mo) or Studio ($59/mo).',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async assertActive(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.planStatus !== 'active') {
      throw new HttpException(
        'An active subscription is required. Choose Intro ($9), Pro ($29), or Studio ($59).',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async assertCanCreateProject(userId: string): Promise<void> {
    await this.assertActive(userId);

    const { plan, limit, activeProjectCount } =
      await this.getUserPlanContext(userId);

    if (activeProjectCount >= limit) {
      const upgradeHint =
        plan === 'trial'
          ? ' Upgrade to Pro or Studio for more project slots.'
          : plan === 'pro'
            ? ' Upgrade to Studio for unlimited projects, or delete a project to free a slot.'
            : '';

      throw new HttpException(
        `You have ${activeProjectCount} of ${limit} active projects. Delete a project to create a new one.${upgradeHint}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async assertCanRender(
    userId: string,
    format: string,
    quality: string,
  ): Promise<void> {
    await this.assertActive(userId);

    const { plan } = await this.getUserPlanContext(userId);

    if (!canUseAspectFormat(plan, format)) {
      throw new HttpException(
        'Intro plan exports 16:9 only. Upgrade to Pro for social aspect ratios.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (quality === '4k' && !canUse4k(plan)) {
      throw new HttpException(
        '4K export requires Studio ($59/mo).',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const inFlight = await this.prisma.renderJob.count({
      where: {
        project: { userId },
        status: { in: ['queued', 'rendering', 'uploading'] },
      },
    });

    if (inFlight >= 3) {
      throw new HttpException(
        'Too many exports in progress. Wait for one to finish before starting another.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordExport(userId: string, renderJobId: string): Promise<void> {
    const existing = await this.prisma.usageEvent.findFirst({
      where: {
        userId,
        type: 'export',
        metadata: { contains: renderJobId },
      },
    });
    if (existing) return;

    await this.prisma.usageEvent.create({
      data: {
        userId,
        type: 'export',
        metadata: JSON.stringify({ renderJobId }),
      },
    });
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

  async createCheckoutSession(
    userId: string,
    email: string,
    plan: CheckoutPlan,
  ): Promise<{ url: string }> {
    const stripe = this.requireStripe();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.planStatus === 'active') {
      throw new BadRequestException('You already have an active subscription.');
    }

    const priceId =
      plan === 'trial'
        ? process.env.STRIPE_PRICE_TRIAL_MONTHLY
        : plan === 'studio'
          ? process.env.STRIPE_PRICE_STUDIO_MONTHLY
          : process.env.STRIPE_PRICE_PRO_MONTHLY;

    if (!priceId) {
      throw new ServiceUnavailableException(
        plan === 'trial'
          ? 'STRIPE_PRICE_TRIAL_MONTHLY is not configured.'
          : plan === 'studio'
            ? 'STRIPE_PRICE_STUDIO_MONTHLY is not configured.'
            : 'STRIPE_PRICE_PRO_MONTHLY is not configured.',
      );
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

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
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

  private resolvePlanFromMetadata(
    metadataPlan: string | undefined,
    planStatus: string,
  ): ArcoPlan | null {
    if (planStatus !== 'active') return null;
    if (metadataPlan === 'trial') return 'trial';
    if (metadataPlan === 'studio') return 'studio';
    return 'pro';
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const metadataPlan = session.metadata?.plan;
    const plan: ArcoPlan =
      metadataPlan === 'trial'
        ? 'trial'
        : metadataPlan === 'studio'
          ? 'studio'
          : 'pro';

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planStatus: 'active',
        plan,
        stripeSubscriptionId: subscriptionId ?? undefined,
      },
    });

    await this.referrals.rewardReferrer(userId);
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

    const plan = this.resolvePlanFromMetadata(
      subscription.metadata?.plan,
      planStatus,
    );

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
        plan,
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
        data: { planStatus: 'active' },
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
