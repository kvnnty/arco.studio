import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { BillingService } from '../billing/billing.service';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { AiService } from './ai.service';
import { GenerateDraftDto } from './dto/generate-draft.dto';
import { GenerateStoryboardDto } from './dto/generate-storyboard.dto';
import { RegenerateMarkerDto } from './dto/regenerate-marker.dto';
import { RefineProjectDto } from './dto/refine-project.dto';
import { ChatDto } from './dto/chat.dto';

type AuthedRequest = Request & { user: { id: string; email: string } };

@UseGuards(ClerkAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly billing: BillingService,
  ) {}

  @UseGuards(SubscriptionGuard)
  @Post('generate-draft')
  async generateDraft(
    @Req() req: AuthedRequest,
    @Body() dto: GenerateDraftDto,
  ) {
    await this.billing.assertProjectDuration(req.user.id, dto.durationMs);
    const referenceId = randomUUID();
    return this.billing.withCreditReservation(
      req.user.id,
      'ai_draft',
      'ai_request',
      referenceId,
      () => this.aiService.generateDraft(dto),
    );
  }

  @UseGuards(SubscriptionGuard)
  @Post('regenerate-marker')
  regenerateMarker(
    @Req() req: AuthedRequest,
    @Body() dto: RegenerateMarkerDto,
  ) {
    const referenceId = randomUUID();
    return this.billing.withCreditReservation(
      req.user.id,
      'ai_regenerate',
      'ai_request',
      referenceId,
      () => this.aiService.regenerateMarker(dto),
    );
  }

  @UseGuards(SubscriptionGuard)
  @Post('refine-project')
  refineProject(@Req() req: AuthedRequest, @Body() dto: RefineProjectDto) {
    const referenceId = randomUUID();
    return this.billing.withCreditReservation(
      req.user.id,
      'ai_refine',
      'ai_request',
      referenceId,
      () => this.aiService.refineProject(dto),
    );
  }

  @UseGuards(SubscriptionGuard)
  @Post('chat')
  chat(@Req() req: AuthedRequest, @Body() dto: ChatDto) {
    const referenceId = randomUUID();
    return this.billing.withCreditReservation(
      req.user.id,
      'ai_chat',
      'ai_request',
      referenceId,
      () => this.aiService.chat(dto),
    );
  }

  @UseGuards(SubscriptionGuard)
  @Post('generate-storyboard')
  async generateStoryboard(
    @Req() req: AuthedRequest,
    @Body() dto: GenerateStoryboardDto,
  ) {
    const targetDurationMs = dto.targetDurationMs ?? 45_000;
    await this.billing.assertProjectDuration(req.user.id, targetDurationMs);
    const referenceId = randomUUID();
    return this.billing.withCreditReservation(
      req.user.id,
      'ai_storyboard',
      'ai_request',
      referenceId,
      () => this.aiService.generateStoryboard(dto),
    );
  }

  @UseGuards(SubscriptionGuard)
  @Post('chat/stream')
  async chatStream(
    @Req() req: AuthedRequest,
    @Body() dto: ChatDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const referenceId = randomUUID();
    const reservation = await this.billing.reserveForAction(
      req.user.id,
      'ai_chat',
      'ai_request',
      referenceId,
    );

    try {
      await this.aiService.streamChat(dto, (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });
      await this.billing.settleReservation(reservation.id);
      res.write('data: [DONE]\n\n');
    } catch (error) {
      await this.billing
        .refundReservation(reservation.id, 'chat_stream_failed')
        .catch(() => undefined);
      const message =
        error instanceof Error ? error.message : 'Chat stream failed';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    }

    res.end();
  }
}
