import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  getExportDimensions,
  parseArcoProject,
  screenshotProjectDurationMs,
  isScreenshotProject,
} from '@arco/project-schema';
import type { ArcoProject, ExportQuality } from '@arco/project-schema';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../storage/s3.service';
import { BillingService } from '../billing/billing.service';
import { normalizeExportQuality } from '../billing/plans';

@Injectable()
export class RenderProcessorService implements OnModuleInit {
  private readonly logger = new Logger(RenderProcessorService.name);
  private readonly remotionRoot: string;
  private readonly monorepoRoot: string;
  private readonly queue: string[] = [];
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly billing: BillingService,
  ) {
    this.monorepoRoot = path.resolve(process.cwd(), '../..');
    this.remotionRoot = path.join(this.monorepoRoot, 'packages/remotion');
  }

  onModuleInit() {
    void this.resumeQueuedJobs();
  }

  private async resumeQueuedJobs() {
    const queued = await this.prisma.renderJob.findMany({
      where: { status: 'queued' },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    for (const job of queued) {
      this.queueJob(job.id);
    }
  }

  queueJob(jobId: string) {
    if (!this.queue.includes(jobId)) {
      this.queue.push(jobId);
    }
    void this.drain();
  }

  private async drain() {
    if (this.running) return;

    const jobId = this.queue.shift();
    if (!jobId) return;

    this.running = true;
    try {
      await this.runJob(jobId);
    } finally {
      this.running = false;
      void this.drain();
    }
  }

  private async runJob(jobId: string) {
    const job = await this.prisma.renderJob.findUnique({
      where: { id: jobId },
      include: { project: { include: { user: true } } },
    });

    if (!job || job.status !== 'queued') {
      return;
    }

    await this.prisma.renderJob.update({
      where: { id: jobId },
      data: { status: 'rendering', errorMessage: null },
    });

    const tempDir = path.join(os.tmpdir(), `arco-render-${randomUUID()}`);
    const propsPath = path.join(tempDir, 'props.json');
    const outputPath = path.join(tempDir, 'output.mp4');

    try {
      await mkdir(tempDir, { recursive: true });

      const project = this.buildRenderProject(
        job.project,
        job.quality ?? '1080p',
      );
      await writeFile(propsPath, JSON.stringify({ project }), 'utf8');

      await this.runRemotionRender(propsPath, outputPath);

      await this.prisma.renderJob.update({
        where: { id: jobId },
        data: { status: 'uploading' },
      });

      const mp4 = await readFile(outputPath);
      const key = `renders/${job.project.userId}/${jobId}.mp4`;
      const uploaded = await this.s3.uploadObject(key, mp4, 'video/mp4');

      await this.prisma.renderJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          outputUrl: uploaded.url,
        },
      });

      await this.billing.recordExport(job.project.userId, jobId);

      this.logger.log(`Render completed: ${jobId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Render failed unexpectedly';

      await this.prisma.renderJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorMessage: message,
        },
      });

      this.logger.error(`Render failed: ${jobId} — ${message}`);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private buildRenderProject(
    projectRecord: {
      projectData: string;
      recordingSrc: string | null;
      title: string;
    },
    quality: string,
  ): ArcoProject {
    let project = parseArcoProject(JSON.parse(projectRecord.projectData));

    const exportQuality = normalizeExportQuality(quality) as ExportQuality;
    const sourceWidth = project.meta.width || 1920;
    const sourceHeight = project.meta.height || 1080;
    const dims = getExportDimensions(exportQuality, sourceWidth, sourceHeight);
    const screenshotMode = isScreenshotProject(project);

    const recordingSrc = screenshotMode
      ? 'placeholder'
      : this.resolveAssetUrl(
          projectRecord.recordingSrc ?? project.recording.src,
        );

    const durationMs = screenshotMode
      ? screenshotProjectDurationMs(project)
      : project.recording.durationMs;

    if (screenshotMode && project.scenes) {
      project = {
        ...project,
        scenes: project.scenes.map((scene) => ({
          ...scene,
          imageSrc: this.resolveAssetUrl(scene.imageSrc),
          voAudioSrc: scene.voAudioSrc
            ? this.resolveAssetUrl(scene.voAudioSrc)
            : undefined,
        })),
      };
    }

    if (project.audio?.customMusicSrc) {
      project = {
        ...project,
        audio: {
          ...project.audio,
          customMusicSrc: this.resolveAssetUrl(project.audio.customMusicSrc),
        },
      };
    }

    project = {
      ...project,
      meta: {
        ...project.meta,
        title: project.meta.title || projectRecord.title,
        width: dims.width,
        height: dims.height,
      },
      recording: {
        ...project.recording,
        src: recordingSrc,
        durationMs,
      },
    };

    return project;
  }

  private resolveAssetUrl(src: string): string {
    if (!src || src === 'pending' || src === 'placeholder') {
      throw new Error('Project has no uploaded asset to render.');
    }

    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    if (src.startsWith('/api/')) {
      const apiOrigin =
        process.env.API_PUBLIC_URL ??
        `http://localhost:${process.env.PORT ?? 8000}`;
      return `${apiOrigin.replace(/\/$/, '')}${src}`;
    }

    return src;
  }

  /** @deprecated use resolveAssetUrl */
  private resolveRecordingUrl(src: string): string {
    return this.resolveAssetUrl(src);
  }

  private runRemotionRender(
    propsPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'pnpm.cmd' : 'pnpm';
      const args = [
        'exec',
        'tsx',
        'src/render-file.ts',
        `--props=${propsPath}`,
        `--output=${outputPath}`,
      ];

      const child = spawn(command, args, {
        cwd: this.remotionRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWindows,
      });

      let stderr = '';

      child.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            stderr.trim() ||
              `Remotion render exited with code ${code ?? 'unknown'}`,
          ),
        );
      });
    });
  }
}
