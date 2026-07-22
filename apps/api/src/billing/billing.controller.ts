import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

type AuthedRequest = Request & { user: { id: string; email: string } };

function normalizeHeaders(headers: Request['headers']): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (Array.isArray(value) && value[0]) {
      normalized[key] = value[0];
    }
  }
  return normalized;
}

function resolveCustomerIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim();
  }
  return req.ip;
}

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @UseGuards(ClerkAuthGuard)
  @Get('status')
  getStatus(@Req() req: AuthedRequest) {
    return this.billing.getStatus(req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Get('usage')
  getUsage(@Req() req: AuthedRequest) {
    return this.billing.getUsageBreakdown(req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Get('credits')
  getCredits(@Req() req: AuthedRequest) {
    return this.billing.getCredits(req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Post('top-up-checkout')
  createTopUpCheckout(@Req() req: AuthedRequest) {
    return this.billing.createTopUpCheckout(
      req.user.id,
      req.user.email,
      resolveCustomerIp(req),
    );
  }

  @UseGuards(ClerkAuthGuard)
  @Post('checkout-session')
  createCheckout(@Req() req: AuthedRequest, @Body() body: CreateCheckoutDto) {
    return this.billing.createCheckoutSession(
      req.user.id,
      req.user.email,
      body.plan,
      body.interval ?? 'monthly',
      resolveCustomerIp(req),
    );
  }

  @UseGuards(ClerkAuthGuard)
  @Post('portal-session')
  createPortal(@Req() req: AuthedRequest) {
    return this.billing.createPortalSession(req.user.id);
  }

  @Post('webhook')
  @HttpCode(202)
  handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: false };
    }

    return this.billing
      .handleWebhook(rawBody, normalizeHeaders(req.headers))
      .then(() => ({
        received: true,
      }));
  }
}
