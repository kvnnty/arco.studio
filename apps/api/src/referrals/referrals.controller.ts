import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { ReferralsService } from './referrals.service';

type AuthedRequest = Request & { user: { id: string } };

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referrals: ReferralsService) {}

  @UseGuards(ClerkAuthGuard)
  @Get()
  getSummary(@Req() req: AuthedRequest) {
    return this.referrals.getSummary(req.user.id);
  }
}
