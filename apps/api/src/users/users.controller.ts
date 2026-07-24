import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { ReferralsService } from '../referrals/referrals.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly referrals: ReferralsService,
  ) {}

  @UseGuards(ClerkAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: AuthenticatedUser }) {
    return this.usersService.findById(req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Patch('me')
  updateMe(
    @Request() req: { user: AuthenticatedUser },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @UseGuards(ClerkAuthGuard)
  @Patch('me/onboarding')
  async updateOnboarding(
    @Request() req: { user: AuthenticatedUser },
    @Body() dto: UpdateOnboardingDto,
  ) {
    await this.referrals.attachReferral(req.user.id, dto.referralCode);
    return this.usersService.updateOnboarding(req.user.id, dto);
  }
}
