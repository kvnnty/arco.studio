import { Module } from '@nestjs/common';
import { RendersController } from './renders.controller.js';
import { RendersService } from './renders.service.js';

@Module({
  controllers: [RendersController],
  providers: [RendersService],
})
export class RendersModule {}
