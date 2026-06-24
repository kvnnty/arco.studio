import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SubscriptionGuard } from '../billing/subscription.guard.js';
import { AiService } from './ai.service.js';
import { GenerateDraftDto } from './dto/generate-draft.dto.js';
import { GenerateStoryboardDto } from './dto/generate-storyboard.dto.js';
import { RegenerateMarkerDto } from './dto/regenerate-marker.dto.js';
import { RefineProjectDto } from './dto/refine-project.dto.js';
import { ChatDto } from './dto/chat.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(SubscriptionGuard)
  @Post('generate-draft')
  generateDraft(@Body() dto: GenerateDraftDto) {
    return this.aiService.generateDraft(dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('regenerate-marker')
  regenerateMarker(@Body() dto: RegenerateMarkerDto) {
    return this.aiService.regenerateMarker(dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('refine-project')
  refineProject(@Body() dto: RefineProjectDto) {
    return this.aiService.refineProject(dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('chat')
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('generate-storyboard')
  generateStoryboard(@Body() dto: GenerateStoryboardDto) {
    return this.aiService.generateStoryboard(dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('chat/stream')
  async chatStream(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await this.aiService.streamChat(dto, (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });
      res.write('data: [DONE]\n\n');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Chat stream failed';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    }

    res.end();
  }
}
