import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        title: dto.title,
        platform: dto.platform ?? 'youtube',
        exportFormat: dto.exportFormat ?? 'mp4',
        projectData: dto.projectData ? JSON.stringify(dto.projectData) : '{}',
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        renderJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            outputUrl: true,
            format: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        renderJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            outputUrl: true,
            format: true,
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.platform !== undefined && { platform: dto.platform }),
        ...(dto.stylePreset !== undefined && { stylePreset: dto.stylePreset }),
        ...(dto.exportFormat !== undefined && {
          exportFormat: dto.exportFormat,
        }),
        ...(dto.projectData !== undefined && {
          projectData: JSON.stringify(dto.projectData),
        }),
        ...(dto.recordingSrc !== undefined && {
          recordingSrc: dto.recordingSrc,
        }),
        ...(dto.markerCount !== undefined && { markerCount: dto.markerCount }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }
}
