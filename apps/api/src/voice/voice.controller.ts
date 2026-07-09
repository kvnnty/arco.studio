import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { GenerateVoiceDto, PreviewVoiceDto } from './dto/voice.dto';
import { VoiceService } from './voice.service';

type AuthedRequest = Request & { user: { id: string; email: string } };

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('voices')
  listVoices() {
    return this.voiceService.listVoices();
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Post('preview')
  preview(@Body() dto: PreviewVoiceDto) {
    return this.voiceService.preview(dto);
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Post('generate')
  generate(@Body() dto: GenerateVoiceDto, @Req() req: AuthedRequest) {
    return this.voiceService.generateForScenes(req.user.id, dto);
  }
}
