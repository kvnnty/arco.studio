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
}
