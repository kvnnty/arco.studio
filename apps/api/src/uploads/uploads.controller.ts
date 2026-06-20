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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SubscriptionGuard } from '../billing/subscription.guard.js';
import { UploadsService } from './uploads.service.js';

type AuthedRequest = Request & { user: { id: string; email: string } };

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    const validFile = this.uploadsService.validateVideoFile(file);
    return this.uploadsService.uploadRecording(req.user.id, validFile);
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
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
