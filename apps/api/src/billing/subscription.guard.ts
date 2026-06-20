import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { BillingService } from './billing.service.js';

type AuthedRequest = {
  user?: { id: string; email: string };
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly billing: BillingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const userId = request.user?.id;
    if (!userId) {
      return false;
    }

    await this.billing.assertActive(userId);
    return true;
  }
}
