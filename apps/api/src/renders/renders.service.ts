import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRenderDto } from './dto/create-render.dto.js';
import { RenderProcessorService } from './render-processor.service.js';

@Injectable()
export class RendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderProcessor: RenderProcessorService,
  ) {}

  async create(userId: string, dto: CreateRenderDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const job = await this.prisma.renderJob.create({
      data: {
        projectId: dto.projectId,
        format: dto.format ?? project.exportFormat ?? '16:9',
        status: 'queued',
      },
    });

    this.renderProcessor.queueJob(job.id);

    return job;
  }

  async findOne(id: string, userId: string) {
    const job = await this.prisma.renderJob.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } },
    });
    if (!job) {
      throw new NotFoundException('Render job not found');
    }
    if (job.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    const { project: _, ...result } = job;
    return result;
  }

  async findAllByUser(userId: string) {
    return this.prisma.renderJob.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
