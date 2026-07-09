import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AUTH_AUDIT_EVENTS,
  MAGIC_LINK_PURPOSES,
  type AuthContext,
  type AuthTokensResponse,
} from '../auth.constants';
import { normalizeEmail } from '../utils/crypto.util';
import { AuditService } from '../services/audit.service';
import { MagicLinkService } from '../services/magic-link.service';
import { SessionService } from '../services/session.service';
import { ReferralsService } from '../../referrals/referrals.service';
import { GitHubOAuthProvider } from '../providers/github-oauth.provider';
import { GoogleOAuthProvider } from '../providers/google-oauth.provider';
import type { OAuthProviderId } from '../providers/oauth-provider.interface';

type OAuthStatePayload = {
  provider: OAuthProviderId;
  type: 'oauth_state';
  referralCode?: string;
};

@Injectable()
export class OAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly google: GoogleOAuthProvider,
    private readonly github: GitHubOAuthProvider,
    private readonly magicLinks: MagicLinkService,
    private readonly sessions: SessionService,
    private readonly audit: AuditService,
    private readonly referrals: ReferralsService,
  ) {}

  getConfiguredProviders(): OAuthProviderId[] {
    const providers: OAuthProviderId[] = [];
    if (this.google.isConfigured()) providers.push('google');
    if (this.github.isConfigured()) providers.push('github');
    return providers;
  }

  startOAuth(providerId: string, res: Response, referralCode?: string): void {
    const provider = this.getProvider(providerId);
    const normalized = referralCode?.trim().toUpperCase();
    const state = this.jwt.sign(
      {
        provider: provider.id,
        type: 'oauth_state',
        ...(normalized ? { referralCode: normalized } : {}),
      } satisfies OAuthStatePayload,
      { expiresIn: '10m' },
    );
    const redirectUri = this.getCallbackUrl(provider.id);
    const url = provider.getAuthorizationUrl(state, redirectUri);
    res.redirect(url);
  }

  async handleCallback(
    providerId: string,
    code: string | undefined,
    state: string | undefined,
    ctx: AuthContext,
  ): Promise<string> {
    const webAppUrl =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';

    if (!code || !state) {
      return `${webAppUrl}/login?error=oauth_cancelled`;
    }

    try {
      const statePayload = this.verifyState(state, providerId);
      const provider = this.getProvider(providerId);
      const profile = await provider.exchangeCode(
        code,
        this.getCallbackUrl(provider.id),
      );

      const user = await this.findOrCreateOAuthUser(
        provider.id,
        profile.providerUserId,
        {
          email: normalizeEmail(profile.email),
          name: profile.name ?? null,
          emailVerified: profile.emailVerified,
          metadata: profile.metadata,
        },
        statePayload.referralCode,
      );

      const token = await this.magicLinks.createToken({
        email: user.email,
        purpose: MAGIC_LINK_PURPOSES.OAUTH_COMPLETE,
        userId: user.id,
        ctx,
      });

      this.audit.enqueue(AUTH_AUDIT_EVENTS.OAUTH_LOGIN_SUCCESS, {
        userId: user.id,
        ctx,
        metadata: { provider: provider.id },
      });

      return `${webAppUrl}/auth/oauth/complete?token=${encodeURIComponent(token)}`;
    } catch (error) {
      this.audit.enqueue(AUTH_AUDIT_EVENTS.OAUTH_LOGIN_FAILED, {
        ctx,
        metadata: {
          provider: providerId,
          reason: error instanceof Error ? error.message : 'unknown',
        },
      });

      const message =
        error instanceof Error ? error.message : 'OAuth sign-in failed';
      return `${webAppUrl}/login?error=${encodeURIComponent(message)}`;
    }
  }

  async completeOAuth(
    token: string,
    ctx: AuthContext,
  ): Promise<AuthTokensResponse> {
    const consumed = await this.magicLinks.consumeToken(
      token,
      MAGIC_LINK_PURPOSES.OAUTH_COMPLETE,
    );
    if (!consumed?.userId) {
      throw new UnauthorizedException(
        'This sign-in link is invalid or expired.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: consumed.userId },
    });
    if (!user) {
      throw new UnauthorizedException('Account not found.');
    }

    const { tokens } = await this.sessions.createSession(user.id, ctx);
    return tokens;
  }

  private verifyState(state: string, providerId: string): OAuthStatePayload {
    try {
      const payload = this.jwt.verify<OAuthStatePayload>(state);
      if (payload.type !== 'oauth_state' || payload.provider !== providerId) {
        throw new UnauthorizedException('Invalid OAuth state.');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired OAuth state.');
    }
  }

  private getProvider(providerId: string) {
    if (providerId === 'google') return this.google;
    if (providerId === 'github') return this.github;
    throw new BadRequestException('Unsupported OAuth provider.');
  }

  private getCallbackUrl(providerId: string): string {
    const base =
      this.config.get<string>('API_PUBLIC_URL') ??
      `http://localhost:${this.config.get('PORT') ?? 8000}`;
    return `${base.replace(/\/$/, '')}/api/auth/oauth/${providerId}/callback`;
  }

  private async findOrCreateOAuthUser(
    provider: string,
    providerUserId: string,
    profile: {
      email: string;
      name: string | null;
      emailVerified: boolean;
      metadata?: Record<string, unknown>;
    },
    referralCode?: string,
  ) {
    const existingIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: { provider, providerUserId },
      },
      include: { user: true },
    });

    if (existingIdentity) {
      return this.prisma.user.update({
        where: { id: existingIdentity.userId },
        data: {
          name: existingIdentity.user.name ?? profile.name,
          emailVerified: true,
          emailVerifiedAt: existingIdentity.user.emailVerifiedAt ?? new Date(),
        },
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      await this.prisma.authIdentity.create({
        data: {
          userId: existingUser.id,
          provider,
          providerUserId,
          metadata: profile.metadata ? JSON.stringify(profile.metadata) : null,
        },
      });

      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name ?? profile.name,
          emailVerified: true,
          emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        emailVerified: profile.emailVerified,
        emailVerifiedAt: profile.emailVerified ? new Date() : null,
        onboardingStep: 'profile',
        exportAllowance: Number(process.env.EXPORT_ALLOWANCE_PRO ?? 15),
      },
    });

    await this.prisma.authIdentity.create({
      data: {
        userId: user.id,
        provider,
        providerUserId,
        metadata: profile.metadata ? JSON.stringify(profile.metadata) : null,
      },
    });

    await this.referrals.attachReferral(user.id, referralCode);

    return user;
  }
}
