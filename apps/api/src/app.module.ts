import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvFilePaths } from './config/env-path';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadsModule } from './uploads/uploads.module';
import { RendersModule } from './renders/renders.module';
import { AiModule } from './ai/ai.module';
import { BrandModule } from './brand/brand.module';
import { VoiceModule } from './voice/voice.module';
import { BillingModule } from './billing/billing.module';
import { ReferralsModule } from './referrals/referrals.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths(),
    }),
    PrismaModule,
    StorageModule,
    BillingModule,
    ReferralsModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    UploadsModule,
    RendersModule,
    AiModule,
    BrandModule,
    VoiceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
