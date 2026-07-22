import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { BillingService } from '../billing/billing.service';
import { ProPlanGuard } from '../billing/pro-plan.guard';
import { UploadsService } from './uploads.service';

type AuthedRequest = Request & { user: { id: string; email: string } };

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly billing: BillingService,
  ) {}

  @UseGuards(ClerkAuthGuard, SubscriptionGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('durationMs') durationMsRaw: string | undefined,
    @Req() req: AuthedRequest,
  ) {
    const durationMs = Number(durationMsRaw);
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      throw new BadRequestException('durationMs is required');
    }

    await this.billing.assertProjectDuration(req.user.id, durationMs);

    const validFile = this.uploadsService.validateVideoFile(file);
    return this.uploadsService.uploadRecording(req.user.id, validFile);
  }

  @UseGuards(ClerkAuthGuard, SubscriptionGuard)
  @Post('thumbnail')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    const validFile = this.uploadsService.validateImageFile(file);
    return this.uploadsService.uploadThumbnail(req.user.id, validFile);
  }

  @UseGuards(ClerkAuthGuard, SubscriptionGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    const validFile = this.uploadsService.validateImageFile(file);
    return this.uploadsService.uploadStoryboardImage(req.user.id, validFile);
  }

  @UseGuards(ClerkAuthGuard, SubscriptionGuard, ProPlanGuard)
  @Post('music')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadMusic(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    const validFile = this.uploadsService.validateMusicFile(file);
    return this.uploadsService.uploadMusic(req.user.id, validFile);
  }

  @Get('object')
  async serveObject(
    @Query('key') key: string | undefined,
    @Res() res: Response,
  ) {
    if (!key) {
      throw new BadRequestException('Missing key query parameter');
    }

    const { stream, contentType, contentLength } =
      await this.uploadsService.streamObject(key);

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, max-age=3600');

    stream.pipe(res);
  }
}
