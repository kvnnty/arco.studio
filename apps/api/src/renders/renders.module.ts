import { Module } from '@nestjs/common';
import { RendersController } from './renders.controller';
import { RenderProcessorService } from './render-processor.service';
import { RendersService } from './renders.service';

@Module({
  controllers: [RendersController],
  providers: [RendersService, RenderProcessorService],
})
export class RendersModule {}
