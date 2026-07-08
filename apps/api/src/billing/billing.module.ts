import { Global, Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionGuard } from './subscription.guard';
import { ProPlanGuard } from './pro-plan.guard';

@Global()
@Module({
  controllers: [BillingController],
  providers: [BillingService, SubscriptionGuard, ProPlanGuard],
  exports: [BillingService, SubscriptionGuard, ProPlanGuard],
})
export class BillingModule {}
