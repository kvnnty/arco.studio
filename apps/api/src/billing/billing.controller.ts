import {
  Controller,
  Get,
  Post,
  Req,
  Headers,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { BillingService } from './billing.service.js';

type AuthedRequest = Request & { user: { id: string; email: string } };

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@Req() req: AuthedRequest) {
    return this.billing.getStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  getUsage(@Req() req: AuthedRequest) {
    return this.billing.getUsageBreakdown(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  createCheckout(@Req() req: AuthedRequest) {
    return this.billing.createCheckoutSession(req.user.id, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal-session')
  createPortal(@Req() req: AuthedRequest) {
    return this.billing.createPortalSession(req.user.id);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    if (!signature) {
      return { received: false };
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: false };
    }

    return this.billing.handleWebhook(rawBody, signature).then(() => ({
      received: true,
    }));
  }
}
