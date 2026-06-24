import { Global, Module } from '@nestjs/common';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { SubscriptionGuard } from './subscription.guard.js';
import { ProPlanGuard } from './pro-plan.guard.js';

@Global()
@Module({
  controllers: [BillingController],
  providers: [BillingService, SubscriptionGuard, ProPlanGuard],
  exports: [BillingService, SubscriptionGuard, ProPlanGuard],
})
export class BillingModule {}
