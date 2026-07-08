import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  AUTH_AUDIT_EVENTS,
  BCRYPT_ROUNDS,
  MAGIC_LINK_PURPOSES,
  RATE_LIMITS,
  type AuthContext,
  type AuthTokensResponse,
} from './auth.constants';
import {
  fingerprintLogin,
  hashToken,
  normalizeEmail,
} from './utils/crypto.util';
import { AuditService } from './services/audit.service';
import { EmailQueueService } from './services/email-queue.service';
import { MagicLinkService } from './services/magic-link.service';
import { RateLimitService } from './services/rate-limit.service';
import { SessionService } from './services/session.service';
import { ReferralsService } from '../referrals/referrals.service';
import type { LoginDto } from './dto/login.dto';
import type { MagicLinkDto } from './dto/magic-link.dto';
import type { RegisterDto } from './dto/register.dto';
import type { ResetPasswordDto, SetPasswordDto } from './dto/auth-session.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
    private readonly magicLinks: MagicLinkService,
    private readonly audit: AuditService,
    private readonly rateLimit: RateLimitService,
    private readonly emailQueue: EmailQueueService,
    private readonly referrals: ReferralsService,
  ) {}

  async requestMagicLink(dto: MagicLinkDto, ctx: AuthContext) {
    const email = normalizeEmail(dto.email);

    if (
      !this.rateLimit.consume(
        `magic:email:${email}`,
        RATE_LIMITS.magicLinkPerEmail,
      ) ||
      !this.rateLimit.consume(
        `magic:ip:${ctx.ipAddress ?? 'unknown'}`,
        RATE_LIMITS.magicLinkPerIp,
      )
    ) {
      this.audit.enqueue(AUTH_AUDIT_EVENTS.RATE_LIMITED, {
        ctx,
        metadata: { action: 'magic_link', email },
      });
      throw new ForbiddenException('Too many requests. Try again later.');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });
    const purpose = this.magicLinks.loginPurposeForUser(
      !!user,
      user?.emailVerified ?? false,
    );

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          emailVerified: false,
          onboardingStep: 'profile',
          exportAllowance: Number(process.env.EXPORT_ALLOWANCE_PRO ?? 15),
        },
      });
      await this.referrals.attachReferral(user.id, dto.referralCode);
    }

    const token = await this.magicLinks.createToken({
      email,
      purpose,
      userId: user.id,
      ctx,
    });

    const url = this.emailQueue.buildMagicLinkUrl(token);
    this.emailQueue.enqueue({
      type: 'magic_link',
      to: email,
      url,
      purpose:
        purpose === MAGIC_LINK_PURPOSES.SIGNUP
          ? 'signup'
          : purpose === MAGIC_LINK_PURPOSES.EMAIL_VERIFY
            ? 'verify'
            : 'login',
    });

    this.audit.enqueue(AUTH_AUDIT_EVENTS.MAGIC_LINK_REQUESTED, {
      userId: user.id,
      ctx,
      metadata: { purpose },
    });

    return {
      sent: true,
      purpose,
    };
  }

  async verifyMagicLink(
    token: string,
    ctx: AuthContext,
  ): Promise<AuthTokensResponse> {
    const consumed = await this.magicLinks.consumeToken(token);
    if (!consumed) {
      this.audit.enqueue(AUTH_AUDIT_EVENTS.MAGIC_LINK_FAILED, { ctx });
      throw new UnauthorizedException('This link is invalid or has expired.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: consumed.email },
    });
    if (!user) {
      throw new UnauthorizedException('Account not found.');
    }

    const wasVerified = user.emailVerified;
    if (!wasVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    await this.detectSuspiciousLogin(user.id, ctx);

    const { tokens } = await this.sessions.createSession(user.id, ctx);

    this.audit.enqueue(AUTH_AUDIT_EVENTS.MAGIC_LINK_VERIFIED, {
      userId: user.id,
      ctx,
      metadata: {
        purpose: consumed.purpose,
        firstVerification: !wasVerified,
        fingerprint: fingerprintLogin(ctx.userAgent, ctx.ipAddress),
      },
    });

    return tokens;
  }

  async register(dto: RegisterDto, ctx: AuthContext) {
    const email = normalizeEmail(dto.email);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const isNewUser = !existing;
    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          email,
          emailVerified: false,
          onboardingStep: 'profile',
          exportAllowance: Number(process.env.EXPORT_ALLOWANCE_PRO ?? 15),
        },
      }));

    if (isNewUser) {
      await this.referrals.attachReferral(user.id, dto.referralCode);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    const token = await this.magicLinks.createToken({
      email,
      purpose: MAGIC_LINK_PURPOSES.EMAIL_VERIFY,
      userId: user.id,
      ctx,
    });

    const url = this.emailQueue.buildMagicLinkUrl(token);
    this.emailQueue.enqueue({
      type: 'magic_link',
      to: email,
      url,
      purpose: 'verify',
    });

    this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_REGISTER, {
      userId: user.id,
      ctx,
    });

    return {
      sent: true,
      message: 'Check your email to verify your account before signing in.',
    };
  }

  async login(dto: LoginDto, ctx: AuthContext): Promise<AuthTokensResponse> {
    const email = normalizeEmail(dto.email);

    if (
      !this.rateLimit.consume(
        `login:ip:${ctx.ipAddress ?? 'unknown'}`,
        RATE_LIMITS.loginPerIp,
      ) ||
      !this.rateLimit.consume(`login:email:${email}`, RATE_LIMITS.loginPerEmail)
    ) {
      this.audit.enqueue(AUTH_AUDIT_EVENTS.RATE_LIMITED, {
        ctx,
        metadata: { action: 'password_login', email },
      });
      throw new ForbiddenException('Too many login attempts. Try again later.');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_LOGIN_FAILED, {
        userId: user?.id,
        ctx,
        metadata: { reason: 'no_password' },
      });
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Verify your email before signing in. Request a new magic link from the login page.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_LOGIN_FAILED, {
        userId: user.id,
        ctx,
      });
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.detectSuspiciousLogin(user.id, ctx);

    const { tokens } = await this.sessions.createSession(user.id, ctx);
    this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_LOGIN_SUCCESS, {
      userId: user.id,
      ctx,
      metadata: {
        fingerprint: fingerprintLogin(ctx.userAgent, ctx.ipAddress),
      },
    });

    return tokens;
  }

  async refresh(
    refreshToken: string,
    ctx: AuthContext,
  ): Promise<AuthTokensResponse> {
    if (
      !this.rateLimit.consume(
        `refresh:${hashToken(refreshToken)}`,
        RATE_LIMITS.refreshPerSession,
      )
    ) {
      throw new ForbiddenException('Too many refresh attempts.');
    }

    return this.sessions.rotateRefreshToken(refreshToken, ctx);
  }

  async logout(refreshToken: string, ctx: AuthContext): Promise<void> {
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: hashToken(refreshToken) },
    });

    if (session) {
      await this.sessions.revokeSession(session.id, session.userId, ctx);
      this.audit.enqueue(AUTH_AUDIT_EVENTS.LOGOUT, {
        userId: session.userId,
        ctx,
      });
    }
  }

  async logoutAll(
    userId: string,
    currentSessionId: string | undefined,
    ctx: AuthContext,
  ) {
    await this.sessions.revokeAllSessions(userId, currentSessionId);
    this.audit.enqueue(AUTH_AUDIT_EVENTS.LOGOUT_ALL, { userId, ctx });
  }

  async listSessions(userId: string, currentSessionId?: string) {
    return this.sessions.listSessions(userId, currentSessionId);
  }

  async revokeSession(userId: string, sessionId: string, ctx: AuthContext) {
    await this.sessions.revokeSession(sessionId, userId, ctx);
  }

  async setPassword(userId: string, dto: SetPasswordDto, ctx: AuthContext) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_SET, { userId, ctx });
    return { success: true };
  }

  async requestPasswordReset(emailInput: string, ctx: AuthContext) {
    const email = normalizeEmail(emailInput);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user?.passwordHash) {
      const token = await this.magicLinks.createToken({
        email,
        purpose: MAGIC_LINK_PURPOSES.PASSWORD_RESET,
        userId: user.id,
        ctx,
      });

      const url = this.emailQueue.buildMagicLinkUrl(
        token,
        '/auth/reset-password',
      );
      this.emailQueue.enqueue({
        type: 'magic_link',
        to: email,
        url,
        purpose: 'password_reset',
      });
    }

    this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, {
      userId: user?.id,
      ctx,
    });

    return {
      sent: true,
      message:
        'If an account exists with that email, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto, ctx: AuthContext) {
    const consumed = await this.magicLinks.consumeToken(
      dto.token,
      MAGIC_LINK_PURPOSES.PASSWORD_RESET,
    );
    if (!consumed?.userId) {
      throw new UnauthorizedException('Invalid or expired reset link.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: consumed.userId },
      data: { passwordHash },
    });

    await this.sessions.revokeAllSessions(consumed.userId);
    this.audit.enqueue(AUTH_AUDIT_EVENTS.PASSWORD_RESET_COMPLETED, {
      userId: consumed.userId,
      ctx,
    });

    return { success: true };
  }

  async completeOnboarding(
    userId: string,
    input: { name?: string; step?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined
          ? { name: input.name.trim() || null }
          : {}),
        ...(input.step === 'completed'
          ? { onboardingCompleted: true, onboardingStep: 'completed' }
          : input.step
            ? { onboardingStep: input.step }
            : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        onboardingCompleted: true,
        onboardingStep: true,
      },
    });
  }

  private async detectSuspiciousLogin(userId: string, ctx: AuthContext) {
    const fingerprint = fingerprintLogin(ctx.userAgent, ctx.ipAddress);
    const recent = await this.prisma.authAuditLog.findFirst({
      where: {
        userId,
        event: {
          in: [
            AUTH_AUDIT_EVENTS.MAGIC_LINK_VERIFIED,
            AUTH_AUDIT_EVENTS.PASSWORD_LOGIN_SUCCESS,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!recent?.metadata) return;

    let previousFingerprint: string | undefined;
    try {
      const parsed = JSON.parse(recent.metadata) as { fingerprint?: string };
      previousFingerprint = parsed.fingerprint;
    } catch {
      return;
    }

    if (previousFingerprint && previousFingerprint !== fingerprint) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        this.emailQueue.enqueue({
          type: 'security_alert',
          to: user.email,
          message: `A sign-in to your account was detected from a new device (${ctx.ipAddress ?? 'unknown IP'}).`,
        });
      }

      this.audit.enqueue(AUTH_AUDIT_EVENTS.SUSPICIOUS_LOGIN, {
        userId,
        ctx,
        metadata: { fingerprint },
      });
    }
  }
}
