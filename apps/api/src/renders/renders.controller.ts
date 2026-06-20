import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SubscriptionGuard } from '../billing/subscription.guard.js';
import { RendersService } from './renders.service.js';
import { CreateRenderDto } from './dto/create-render.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('renders')
export class RendersController {
  constructor(private readonly rendersService: RendersService) {}

  @UseGuards(SubscriptionGuard)
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateRenderDto,
  ) {
    return this.rendersService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.rendersService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.rendersService.findOne(id, req.user.id);
  }
}
