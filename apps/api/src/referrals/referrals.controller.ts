import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ReferralsService } from './referrals.service.js';

type AuthedRequest = Request & { user: { id: string } };

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referrals: ReferralsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getSummary(@Req() req: AuthedRequest) {
    return this.referrals.getSummary(req.user.id);
  }
}
