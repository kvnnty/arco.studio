import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { RendersModule } from './renders/renders.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    UploadsModule,
    RendersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
