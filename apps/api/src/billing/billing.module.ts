import { Global, Module } from '@nestjs/common';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { SubscriptionGuard } from './subscription.guard.js';

@Global()
@Module({
  controllers: [BillingController],
  providers: [BillingService, SubscriptionGuard],
  exports: [BillingService, SubscriptionGuard],
})
export class BillingModule {}
