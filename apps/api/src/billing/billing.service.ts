import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { Polar } from '@polar-sh/sdk';
import {
  validateEvent,
  WebhookVerificationError,
} from '@polar-sh/sdk/webhooks';
import type { CustomerState } from '@polar-sh/sdk/models/components/customerstate';
import type { CustomerStateSubscription } from '@polar-sh/sdk/models/components/customerstatesubscription';
import type { Subscription } from '@polar-sh/sdk/models/components/subscription';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralsService } from '../referrals/referrals.service';
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
} from './plans';
import {
  planRank,
  polarAccessToken,
  polarBillingConfigured,
  polarCheckoutUrls,
  polarServer,
  polarWebhookSecret,
  resolvePlanFromProductId,
  resolvePolarProductId,
  validatePolarBillingConfig,
  type BillingInterval,
} from './polar.config';

export type BillingStatus = {
  planStatus: string;
  plan: string | null;
  activeProjectCount: number;
  activeProjectLimit: number;
  activeProjectsRemaining: number;
  hasUnlimitedProjects: boolean;
  periodEnd: string | null;
  canUseProduct: boolean;
  canUploadCustomMusic: boolean;
  allowedExportQualities: ExportQuality[];
  maxProjectDurationMs: number;
};

export type CheckoutPlan = ArcoPlan;

@Injectable()
export class BillingService implements OnModuleInit {
  private readonly logger = new Logger(BillingService.name);
  private polar: Polar | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralsService,
  ) {
    const token = polarAccessToken();
    if (token) {
      this.polar = new Polar({
        accessToken: token,
        server: polarServer(),
      });
    }
  }

  onModuleInit(): void {
    const missing = validatePolarBillingConfig();
    if (missing.length > 0) {
      this.logger.warn(
        `Polar billing is not fully configured. Missing: ${missing.join(', ')}`,
      );
      return;
    }
    this.logger.log(`Polar billing ready (${polarServer()}).`);
  }

  private requirePolar(): Polar {
    if (!this.polar) {
      throw new ServiceUnavailableException(
        'Billing is not configured. Set POLAR_ACCESS_TOKEN and product IDs.',
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
    if (polarBillingConfigured()) {
      await this.refreshCustomerStateFromPolar(userId).catch((error) => {
        this.logger.debug(
          `Polar state refresh skipped for ${userId}: ${
            error instanceof Error ? error.message : error
          }`,
        );
      });
    }

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

  async recordAiUsage(
    userId: string,
    type: string,
    metadata?: object,
  ): Promise<void> {
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
      throw new BadRequestException(
        'You already have an active subscription. Use Manage subscription to change plans.',
      );
    }

    if (plan === 'trial' && interval === 'annual') {
      throw new BadRequestException('Intro plan is billed monthly only.');
    }

    let productId: string;
    try {
      productId = resolvePolarProductId(plan, interval);
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? error.message
          : 'Polar product is not configured.',
      );
    }

    const { successUrl, returnUrl } = polarCheckoutUrls();

    const session = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: userId,
      customerEmail: email,
      customerIpAddress: customerIpAddress ?? undefined,
      metadata: { userId, plan, interval },
      successUrl,
      returnUrl,
      allowDiscountCodes: true,
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

    const { portalReturnUrl } = polarCheckoutUrls();

    try {
      const session = await polar.customerSessions.create({
        externalCustomerId: userId,
        returnUrl: portalReturnUrl,
      });

      if (!session.customerPortalUrl) {
        throw new BadRequestException(
          'Could not create customer portal session.',
        );
      }

      if (session.customerId !== user.polarCustomerId) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { polarCustomerId: session.customerId },
        });
      }

      return { url: session.customerPortalUrl };
    } catch (error) {
      this.logger.warn(
        `Polar portal session failed for ${userId}: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw new BadRequestException(
        'No billing account found yet. Subscribe to a plan first.',
      );
    }
  }

  async handleWebhook(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<void> {
    const webhookSecret = polarWebhookSecret();
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
        await this.applyCustomerState(event.data);
        break;
      case 'subscription.past_due':
        await this.applySubscriptionAccess(event.data, 'past_due');
        break;
      case 'subscription.revoked':
        await this.applySubscriptionAccess(event.data, 'inactive');
        break;
      default:
        break;
    }
  }

  private async refreshCustomerStateFromPolar(userId: string): Promise<void> {
    const polar = this.requirePolar();

    try {
      const state = await polar.customers.getStateExternal({
        externalId: userId,
      });
      await this.applyCustomerState(state);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes('404') ||
        message.toLowerCase().includes('not found')
      ) {
        return;
      }
      throw error;
    }
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

  private resolvePlanFromMetadata(metadataPlan: unknown): ArcoPlan | null {
    if (metadataPlan === 'trial') return 'trial';
    if (metadataPlan === 'studio') return 'studio';
    if (metadataPlan === 'pro') return 'pro';
    return null;
  }

  private resolvePlanFromSubscription(
    subscription: CustomerStateSubscription | Subscription,
  ): ArcoPlan | null {
    return (
      resolvePlanFromProductId(subscription.productId) ??
      this.resolvePlanFromMetadata(subscription.metadata?.plan)
    );
  }

  private mapActiveSubscriptionStatus(status: string): string {
    if (status === 'active' || status === 'trialing') {
      return 'active';
    }
    return 'inactive';
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

  private async findUserIdForSubscription(
    subscription: Subscription,
  ): Promise<string | null> {
    const externalId = subscription.customer?.externalId;
    if (externalId) {
      return externalId;
    }

    const user = await this.prisma.user.findFirst({
      where: { polarCustomerId: subscription.customerId },
    });
    return user?.id ?? null;
  }

  private async applyCustomerState(state: CustomerState): Promise<void> {
    const userId = await this.findUserIdForCustomerState(state);
    if (!userId) return;

    const subscription = this.pickBestSubscription(state.activeSubscriptions);

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

    const planStatus = this.mapActiveSubscriptionStatus(subscription.status);
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

  private async applySubscriptionAccess(
    subscription: Subscription,
    planStatus: 'past_due' | 'inactive',
  ): Promise<void> {
    const userId = await this.findUserIdForSubscription(subscription);
    if (!userId) return;

    const plan = this.resolvePlanFromSubscription(subscription);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        polarCustomerId: subscription.customerId,
        polarSubscriptionId: subscription.id,
        planStatus,
        plan: planStatus === 'past_due' ? plan : null,
        periodEnd:
          planStatus === 'past_due' ? subscription.currentPeriodEnd : null,
      },
    });
  }
}
