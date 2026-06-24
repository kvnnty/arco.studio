import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { S3Service } from '../storage/s3.service.js';

@Injectable()
export class UploadsService {
  constructor(private readonly s3: S3Service) {}

  async uploadRecording(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const ext = extname(file.originalname) || '.mp4';
    const key = `recordings/${userId}/${randomUUID()}${ext}`;

    return this.s3.uploadObject(key, file.buffer, file.mimetype);
  }

  async uploadThumbnail(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const ext = extname(file.originalname) || '.jpg';
    const key = `thumbnails/${userId}/${randomUUID()}${ext}`;

    return this.s3.uploadObject(key, file.buffer, file.mimetype);
  }

  async uploadStoryboardImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const ext = extname(file.originalname) || '.png';
    const key = `images/${userId}/${randomUUID()}${ext}`;

    return this.s3.uploadObject(key, file.buffer, file.mimetype);
  }

  async uploadMusic(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string; filename: string }> {
    const ext = extname(file.originalname) || '.mp3';
    const key = `music/${userId}/${randomUUID()}${ext}`;
    const uploaded = await this.s3.uploadObject(key, file.buffer, file.mimetype);

    return {
      ...uploaded,
      filename: file.originalname,
    };
  }

  async streamObject(key: string) {
    try {
      return await this.s3.getObjectStream(key);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  validateVideoFile(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Only video files are allowed');
    }
    return file;
  }

  validateImageFile(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
    return file;
  }

  validateMusicFile(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowed = new Set([
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
    ]);
    const ext = extname(file.originalname).toLowerCase();
    const allowedExt = new Set(['.mp3', '.wav']);

    if (!allowed.has(file.mimetype) && !allowedExt.has(ext)) {
      throw new BadRequestException('Only MP3 or WAV files are allowed');
    }

    return file;
  }
}
