import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AiService } from './ai.service.js';
import { GenerateDraftDto } from './dto/generate-draft.dto.js';
import { RegenerateMarkerDto } from './dto/regenerate-marker.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-draft')
  generateDraft(@Body() dto: GenerateDraftDto) {
    return this.aiService.generateDraft(dto);
  }

  @Post('regenerate-marker')
  regenerateMarker(@Body() dto: RegenerateMarkerDto) {
    return this.aiService.regenerateMarker(dto);
  }
}
