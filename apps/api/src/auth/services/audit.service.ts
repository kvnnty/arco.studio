import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_AUDIT_EVENTS } from '../auth.constants';
import type { AuthContext } from '../auth.constants';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(
    event: (typeof AUTH_AUDIT_EVENTS)[keyof typeof AUTH_AUDIT_EVENTS] | string,
    input: {
      userId?: string;
      metadata?: Record<string, unknown>;
      ctx?: AuthContext;
    },
  ): void {
    setImmediate(() => {
      void this.persist(event, input).catch((error) => {
        console.error('[AuditService] Failed to persist audit log', error);
      });
    });
  }

  private async persist(
    event: string,
    input: {
      userId?: string;
      metadata?: Record<string, unknown>;
      ctx?: AuthContext;
    },
  ): Promise<void> {
    await this.prisma.authAuditLog.create({
      data: {
        userId: input.userId,
        event,
        ipAddress: input.ctx?.ipAddress,
        userAgent: input.ctx?.userAgent,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  }
}
