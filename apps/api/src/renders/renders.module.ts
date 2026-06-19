import { Module } from '@nestjs/common';
import { RendersController } from './renders.controller.js';
import { RenderProcessorService } from './render-processor.service.js';
import { RendersService } from './renders.service.js';

@Module({
  controllers: [RendersController],
  providers: [RendersService, RenderProcessorService],
})
export class RendersModule {}
