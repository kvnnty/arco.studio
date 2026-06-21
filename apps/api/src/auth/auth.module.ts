import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { AuditService } from './services/audit.service.js';
import { EmailQueueService } from './services/email-queue.service.js';
import { MagicLinkService } from './services/magic-link.service.js';
import { RateLimitService } from './services/rate-limit.service.js';
import { SessionService } from './services/session.service.js';
import { TokenService } from './services/token.service.js';

import { OAuthService } from './services/oauth.service.js';
import { GoogleOAuthProvider } from './providers/google-oauth.provider.js';
import { GitHubOAuthProvider } from './providers/github-oauth.provider.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'arco-dev-secret',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    SessionService,
    MagicLinkService,
    AuditService,
    RateLimitService,
    EmailQueueService,
    OAuthService,
    GoogleOAuthProvider,
    GitHubOAuthProvider,
    JwtStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
