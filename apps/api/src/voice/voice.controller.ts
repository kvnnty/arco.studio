import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { BillingService } from '../billing/billing.service';
import { creditCostForVoiceGenerate } from '../billing/plans';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { GenerateVoiceDto, PreviewVoiceDto } from './dto/voice.dto';
import { VoiceService } from './voice.service';

type AuthedRequest = Request & { user: { id: string; email: string } };

@Controller('voice')
export class VoiceController {
  constructor(
    private readonly voiceService: VoiceService,
    private readonly billing: BillingService,
  ) {}

  @Get('voices')
  listVoices() {
    return this.voiceService.listVoices();
  }

  @UseGuards(ClerkAuthGuard, SubscriptionGuard)
  @Post('preview')
  preview(@Req() req: AuthedRequest, @Body() dto: PreviewVoiceDto) {
    const referenceId = randomUUID();
    return this.billing.withCreditReservation(
      req.user.id,
      'voice_preview',
      'voice_request',
      referenceId,
      () => this.voiceService.preview(dto),
    );
  }

  @UseGuards(ClerkAuthGuard, SubscriptionGuard)
  @Post('generate')
  generate(@Body() dto: GenerateVoiceDto, @Req() req: AuthedRequest) {
    const referenceId = randomUUID();
    const amount = creditCostForVoiceGenerate(dto.scenes.length);
    return this.billing.withCreditReservation(
      req.user.id,
      'voice_generate',
      'voice_request',
      referenceId,
      () => this.voiceService.generateForScenes(req.user.id, dto),
      amount,
      { sceneCount: dto.scenes.length },
    );
  }
}
