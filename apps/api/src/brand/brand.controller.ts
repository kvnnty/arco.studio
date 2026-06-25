import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SubscriptionGuard } from '../billing/subscription.guard.js';
import { BrandService } from './brand.service.js';
import { AnalyzeUrlDto } from './dto/analyze-url.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('preview-url')
  previewUrl(@Body() dto: AnalyzeUrlDto) {
    return this.brandService.analyzeUrl(dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('analyze-url')
  analyzeUrl(@Body() dto: AnalyzeUrlDto) {
    return this.brandService.analyzeUrl(dto);
  }
}
