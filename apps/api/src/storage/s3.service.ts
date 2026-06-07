import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Readable } from 'stream';

export type S3UploadResult = {
  key: string;
  url: string;
};

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string | null;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== 'false';

    this.bucket = process.env.S3_BUCKET || 'arco-uploads';
    this.publicBaseUrl = process.env.S3_PUBLIC_URL || null;

    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      forcePathStyle,
    });
  }

  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket ready: ${this.bucket}`);
    } catch {
      this.logger.warn(`Creating S3 bucket: ${this.bucket}`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<S3UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return {
      key,
      url: this.resolvePublicUrl(key),
    };
  }

  async getObjectStream(key: string): Promise<{
    stream: Readable;
    contentType?: string;
    contentLength?: number;
  }> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    if (!response.Body) {
      throw new Error('Empty object body');
    }

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  }

  resolvePublicUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return `/api/uploads/object?key=${encodeURIComponent(key)}`;
  }
}
