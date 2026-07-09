import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { parseArcoProject, projectDurationMs } from '@arco/project-schema';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { normalizeExportQuality } from '../billing/plans';
import { CreateRenderDto } from './dto/create-render.dto';
import { RenderProcessorService } from './render-processor.service';

@Injectable()
export class RendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderProcessor: RenderProcessorService,
    private readonly billing: BillingService,
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

    const format = project.exportFormat ?? '16:9';
    const quality = normalizeExportQuality(dto.quality ?? '1080p');

    await this.billing.assertCanRender(userId, quality);

    try {
      const parsed = parseArcoProject(JSON.parse(project.projectData));
      await this.billing.assertProjectDuration(
        userId,
        projectDurationMs(parsed),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Invalid project data');
    }

    const tempJobId = `pending-${Date.now()}`;
    const reservation = await this.billing.reserveForExport(
      userId,
      tempJobId,
      quality,
    );

    const job = await this.prisma.renderJob.create({
      data: {
        projectId: dto.projectId,
        format,
        quality,
        status: 'queued',
        creditReservationId: reservation.id,
      },
    });

    await this.billing.updateReservationReference(reservation.id, job.id, {
      quality,
      renderJobId: job.id,
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
