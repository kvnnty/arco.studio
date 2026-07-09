import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuditService } from './services/audit.service';
import { EmailQueueService } from './services/email-queue.service';
import { MagicLinkService } from './services/magic-link.service';
import { RateLimitService } from './services/rate-limit.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';

import { OAuthService } from './services/oauth.service';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';
import { GitHubOAuthProvider } from './providers/github-oauth.provider';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'arco-dev-secret',
      }),
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
