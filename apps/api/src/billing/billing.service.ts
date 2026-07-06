import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Polar } from '@polar-sh/sdk';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import type { CustomerState } from '@polar-sh/sdk/models/components/customerstate.js';
import type { CustomerStateSubscription } from '@polar-sh/sdk/models/components/customerstatesubscription.js';
import type { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReferralsService } from '../referrals/referrals.service.js';
import {
  activeProjectLimit,
  allowedExportQualities,
  canUploadCustomMusic,
  canUseExportQuality,
  canUseProjectDuration,
  hasUnlimitedProjects,
  maxProjectDurationMs,
  parsePlan,
  type ArcoPlan,
  type ExportQuality,
} from './plans.js';
import {
  planRank,
  resolvePlanFromProductId,
  resolvePolarProductId,
  type BillingInterval,
} from './polar-products.js';

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
  allowedExportQualities: ExportQuality[];
  maxProjectDurationMs: number;
};

export type CheckoutPlan = ArcoPlan;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private polar: Polar | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralsService,
  ) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (accessToken) {
      this.polar = new Polar({
        accessToken,
        server:
          process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production',
      });
    }
  }

  private requirePolar(): Polar {
    if (!this.polar) {
      throw new ServiceUnavailableException(
        'Billing is not configured. Set POLAR_ACCESS_TOKEN.',
      );
    }
    return this.polar;
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
      allowedExportQualities:
        user.planStatus === 'active' ? allowedExportQualities(plan) : [],
      maxProjectDurationMs:
        user.planStatus === 'active' ? maxProjectDurationMs(plan) : 0,
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

  async assertProjectDuration(
    userId: string,
    durationMs: number,
  ): Promise<void> {
    await this.assertActive(userId);

    const { plan } = await this.getUserPlanContext(userId);

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      throw new HttpException(
        'Invalid project duration.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (canUseProjectDuration(plan, durationMs)) {
      return;
    }

    if (plan === 'trial') {
      throw new HttpException(
        'Intro plan supports videos up to 2 minutes. Upgrade to Pro for videos up to 5 minutes.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (plan === 'pro') {
      throw new HttpException(
        'Pro plan supports videos up to 5 minutes. Upgrade to Studio for videos up to 10 minutes.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    throw new HttpException(
      'This video exceeds your plan duration limit.',
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  async assertCanRender(userId: string, quality: string): Promise<void> {
    await this.assertActive(userId);

    const { plan } = await this.getUserPlanContext(userId);

    if (!canUseExportQuality(plan, quality)) {
      if (quality === '4k') {
        throw new HttpException(
          '4K export requires Studio ($59/mo).',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      if (quality === '1080p') {
        throw new HttpException(
          '1080p export requires Pro ($29/mo) or higher.',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      throw new HttpException(
        'Subscribe to export videos.',
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
    interval: BillingInterval = 'monthly',
    customerIpAddress?: string,
  ): Promise<{ url: string }> {
    const polar = this.requirePolar();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.planStatus === 'active') {
      throw new BadRequestException('You already have an active subscription.');
    }

    if (plan === 'trial' && interval === 'annual') {
      throw new BadRequestException('Intro plan is billed monthly only.');
    }

    let productId: string;
    try {
      productId = resolvePolarProductId(plan, interval);
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Polar product is not configured.',
      );
    }

    const successUrl =
      process.env.POLAR_SUCCESS_URL ??
      'http://localhost:3000/dashboard/billing?checkout=success';
    const returnUrl =
      process.env.POLAR_RETURN_URL ??
      'http://localhost:3000/dashboard/billing?checkout=canceled';

    const launchDiscountId = process.env.POLAR_LAUNCH_DISCOUNT_ID;

    const session = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: userId,
      customerEmail: email,
      customerIpAddress: customerIpAddress ?? undefined,
      metadata: { userId, plan, interval },
      successUrl,
      returnUrl,
      ...(launchDiscountId && plan === 'trial'
        ? { discountId: launchDiscountId, allowDiscountCodes: false }
        : { allowDiscountCodes: true }),
    });

    if (!session.url) {
      throw new BadRequestException('Could not create checkout session.');
    }

    if (session.customerId && session.customerId !== user.polarCustomerId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { polarCustomerId: session.customerId },
      });
    }

    return { url: session.url };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const polar = this.requirePolar();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const returnUrl =
      process.env.POLAR_PORTAL_RETURN_URL ??
      'http://localhost:3000/dashboard/billing';

    const session = await polar.customerSessions.create({
      externalCustomerId: userId,
      returnUrl,
    });

    if (!session.customerPortalUrl) {
      throw new BadRequestException('Could not create customer portal session.');
    }

    if (session.customerId !== user.polarCustomerId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { polarCustomerId: session.customerId },
      });
    }

    return { url: session.customerPortalUrl };
  }

  async handleWebhook(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<void> {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'POLAR_WEBHOOK_SECRET is not configured.',
      );
    }

    let event: ReturnType<typeof validateEvent>;
    try {
      event = validateEvent(rawBody, headers, webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        this.logger.warn('Polar webhook signature verification failed.');
        throw new BadRequestException('Invalid webhook signature');
      }
      throw error;
    }

    switch (event.type) {
      case 'customer.state_changed':
        await this.onCustomerStateChanged(event.data);
        break;
      case 'subscription.active':
      case 'subscription.updated':
      case 'subscription.canceled':
      case 'subscription.revoked':
      case 'subscription.past_due':
      case 'subscription.uncanceled':
        await this.onSubscriptionEvent(event.data);
        break;
      case 'checkout.updated':
        if (event.data.status === 'succeeded') {
          await this.onCheckoutSucceeded(event.data);
        }
        break;
      case 'order.paid':
        await this.onOrderPaid(event.data);
        break;
      default:
        break;
    }
  }

  private getCustomerStateSubscriptions(
    state: CustomerState,
  ): CustomerStateSubscription[] {
    return state.activeSubscriptions;
  }

  private pickBestSubscription(
    subscriptions: CustomerStateSubscription[],
  ): CustomerStateSubscription | null {
    if (subscriptions.length === 0) {
      return null;
    }

    return subscriptions.reduce((best, current) => {
      const bestPlan =
        resolvePlanFromProductId(best.productId) ??
        this.resolvePlanFromMetadata(best.metadata?.plan);
      const currentPlan =
        resolvePlanFromProductId(current.productId) ??
        this.resolvePlanFromMetadata(current.metadata?.plan);

      if (!bestPlan) return current;
      if (!currentPlan) return best;

      return planRank(currentPlan) >= planRank(bestPlan) ? current : best;
    });
  }

  private resolvePlanFromMetadata(
    metadataPlan: unknown,
  ): ArcoPlan | null {
    if (metadataPlan === 'trial') return 'trial';
    if (metadataPlan === 'studio') return 'studio';
    if (metadataPlan === 'pro') return 'pro';
    return null;
  }

  private mapSubscriptionStatus(status: string): string {
    if (status === 'active' || status === 'trialing') {
      return 'active';
    }
    if (status === 'past_due' || status === 'unpaid') {
      return 'past_due';
    }
    if (status === 'canceled') {
      return 'canceled';
    }
    return 'inactive';
  }

  private resolvePlanFromSubscription(
    subscription: CustomerStateSubscription | Subscription,
  ): ArcoPlan | null {
    const fromProduct = resolvePlanFromProductId(subscription.productId);
    if (fromProduct) {
      return fromProduct;
    }
    return this.resolvePlanFromMetadata(subscription.metadata?.plan);
  }

  private async findUserIdForSubscription(
    subscription: Subscription,
  ): Promise<string | null> {
    const externalId = subscription.customer?.externalId;
    if (externalId) {
      return externalId;
    }

    const customerId = subscription.customerId;
    const user = await this.prisma.user.findFirst({
      where: { polarCustomerId: customerId },
    });
    return user?.id ?? null;
  }

  private async findUserIdForCustomerState(
    state: CustomerState,
  ): Promise<string | null> {
    if (state.externalId) {
      return state.externalId;
    }

    const user = await this.prisma.user.findFirst({
      where: { polarCustomerId: state.id },
    });
    return user?.id ?? null;
  }

  private async onCustomerStateChanged(state: CustomerState): Promise<void> {
    const userId = await this.findUserIdForCustomerState(state);
    if (!userId) return;

    const subscriptions = this.getCustomerStateSubscriptions(state);
    const subscription = this.pickBestSubscription(subscriptions);

    if (!subscription) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          polarCustomerId: state.id,
          planStatus: 'inactive',
          plan: null,
          polarSubscriptionId: null,
          periodEnd: null,
        },
      });
      return;
    }

    const planStatus = this.mapSubscriptionStatus(subscription.status);
    const plan = this.resolvePlanFromSubscription(subscription);

    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planStatus: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        polarCustomerId: state.id,
        polarSubscriptionId: subscription.id,
        planStatus,
        plan: planStatus === 'active' ? plan : null,
        periodEnd: subscription.currentPeriodEnd,
      },
    });

    if (previous?.planStatus !== 'active' && planStatus === 'active') {
      await this.referrals.rewardReferrer(userId);
    }
  }

  private async onSubscriptionEvent(subscription: Subscription): Promise<void> {
    const userId = await this.findUserIdForSubscription(subscription);
    if (!userId) return;

    const planStatus = this.mapSubscriptionStatus(subscription.status);
    const plan = this.resolvePlanFromSubscription(subscription);

    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planStatus: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        polarCustomerId: subscription.customerId,
        polarSubscriptionId: subscription.id,
        planStatus,
        plan:
          planStatus === 'active' || planStatus === 'past_due' ? plan : null,
        periodEnd: subscription.currentPeriodEnd,
      },
    });

    if (previous?.planStatus !== 'active' && planStatus === 'active') {
      await this.referrals.rewardReferrer(userId);
    }
  }

  private async onCheckoutSucceeded(checkout: {
    externalCustomerId?: string | null;
    customerId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const userId =
      checkout.externalCustomerId ??
      (typeof checkout.metadata?.userId === 'string'
        ? checkout.metadata.userId
        : null);
    if (!userId) return;

    const metadataPlan = checkout.metadata?.plan;
    const plan =
      metadataPlan === 'trial'
        ? 'trial'
        : metadataPlan === 'studio'
          ? 'studio'
          : metadataPlan === 'pro'
            ? 'pro'
            : null;

    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planStatus: true, hadLaunchOffer: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(checkout.customerId
          ? { polarCustomerId: checkout.customerId }
          : {}),
        planStatus: 'active',
        ...(plan ? { plan } : {}),
        ...(plan === 'trial' && process.env.POLAR_LAUNCH_DISCOUNT_ID
          ? { hadLaunchOffer: true }
          : {}),
      },
    });

    if (previous?.planStatus !== 'active') {
      await this.referrals.rewardReferrer(userId);
    }
  }

  private async onOrderPaid(order: {
    customerId?: string;
    billingReason?: string | null;
  }): Promise<void> {
    if (order.billingReason !== 'subscription_cycle') {
      return;
    }

    const user = await this.prisma.user.findFirst({
      where: { polarCustomerId: order.customerId },
    });
    if (!user) return;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { planStatus: 'active' },
    });
  }
}
