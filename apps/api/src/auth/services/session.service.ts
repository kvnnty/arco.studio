import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AUTH_AUDIT_EVENTS,
  REFRESH_TOKEN_TTL_MS,
  type AuthContext,
  type AuthTokensResponse,
} from '../auth.constants.js';
import {
  deviceLabelFromUserAgent,
  generateOpaqueToken,
  hashToken,
} from '../utils/crypto.util.js';
import { AuditService } from './audit.service.js';
import { TokenService } from './token.service.js';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly audit: AuditService,
  ) {}

  async createSession(
    userId: string,
    ctx: AuthContext,
    familyId?: string,
  ): Promise<{ tokens: AuthTokensResponse; sessionId: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const refreshToken = generateOpaqueToken();
    const session = await this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: hashToken(refreshToken),
        familyId: familyId ?? crypto.randomUUID(),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        deviceLabel: deviceLabelFromUserAgent(ctx.userAgent),
      },
    });

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      sid: session.id,
    });

    return {
      sessionId: session.id,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.tokenService.getAccessTokenTtlSeconds(),
        tokenType: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
        },
      },
    };
  }

  async rotateRefreshToken(
    refreshToken: string,
    ctx: AuthContext,
  ): Promise<AuthTokensResponse> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      await this.revokeFamily(session.familyId, session.userId, ctx);
      this.audit.enqueue(AUTH_AUDIT_EVENTS.TOKEN_REFRESH_REUSE, {
        userId: session.userId,
        ctx,
        metadata: { familyId: session.familyId },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const { tokens } = await this.createSession(
      session.userId,
      ctx,
      session.familyId,
    );

    this.audit.enqueue(AUTH_AUDIT_EVENTS.TOKEN_REFRESH, {
      userId: session.userId,
      ctx,
      metadata: { previousSessionId: session.id },
    });

    return tokens;
  }

  async revokeSession(sessionId: string, userId: string, ctx?: AuthContext) {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.audit.enqueue(AUTH_AUDIT_EVENTS.SESSION_REVOKED, {
      userId,
      ctx,
      metadata: { sessionId },
    });
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string) {
    await this.prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }

  async listSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.prisma.authSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
      select: {
        id: true,
        deviceLabel: true,
        ipAddress: true,
        userAgent: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return sessions.map((session) => ({
      ...session,
      current: session.id === currentSessionId,
    }));
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { lastUsedAt: new Date() },
    });
  }

  async assertSessionActive(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.authSession.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or revoked');
    }
  }

  private async revokeFamily(
    familyId: string,
    userId: string,
    ctx?: AuthContext,
  ): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { familyId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.audit.enqueue(AUTH_AUDIT_EVENTS.SUSPICIOUS_LOGIN, {
      userId,
      ctx,
      metadata: { reason: 'refresh_token_reuse', familyId },
    });
  }
}
