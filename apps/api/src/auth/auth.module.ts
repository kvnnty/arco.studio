import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Global()
@Module({
  imports: [UsersModule],
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard, UsersModule],
})
export class AuthModule {}
