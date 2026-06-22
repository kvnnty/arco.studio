import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { RendersModule } from './renders/renders.module.js';
import { AiModule } from './ai/ai.module.js';
import { BrandModule } from './brand/brand.module.js';
import { BillingModule } from './billing/billing.module.js';
import { ReferralsModule } from './referrals/referrals.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
