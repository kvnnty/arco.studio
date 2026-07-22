import { createClerkClient, verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from './authenticated-user';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

function bearerToken(request: Request): string | null {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length).trim() || null;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly secretKey: string;
  private readonly jwtKey: string;
  private readonly authorizedParties: string[];
  private readonly clerk: ReturnType<typeof createClerkClient>;

  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    this.secretKey = config.get<string>('CLERK_SECRET_KEY')?.trim() ?? '';
    this.jwtKey =
      config.get<string>('CLERK_JWT_KEY')?.trim().replace(/\\n/g, '\n') ?? '';
    this.authorizedParties = (
      config.get<string>('CLERK_AUTHORIZED_PARTIES') ?? ''
    )
      .split(',')
      .map((party) => party.trim())
      .filter(Boolean);
    this.clerk = createClerkClient({ secretKey: this.secretKey });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      !this.secretKey ||
      !this.jwtKey ||
      this.authorizedParties.length === 0
    ) {
      throw new ServiceUnavailableException(
        'Authentication is not configured.',
      );
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request);
    if (!token) throw new UnauthorizedException('Authentication required.');

    try {
      const claims = await verifyToken(token, {
        jwtKey: this.jwtKey,
        authorizedParties: this.authorizedParties,
      });
      if (!claims.sub || !claims.sid) {
        throw new UnauthorizedException('Invalid session token.');
      }

      let localUser = await this.users.findByClerkUserId(claims.sub);
      if (!localUser) {
        const clerkUser = await this.clerk.users.getUser(claims.sub);
        const primaryEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId,
        );
        if (
          !primaryEmail?.emailAddress ||
          primaryEmail.verification?.status !== 'verified'
        ) {
          throw new UnauthorizedException('A verified email is required.');
        }
        const fullName = [clerkUser.firstName, clerkUser.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();
        localUser = await this.users.resolveClerkIdentity({
          clerkUserId: claims.sub,
          email: primaryEmail.emailAddress.toLowerCase(),
          name: fullName || null,
        });
      }

      request.user = {
        id: localUser.id,
        clerkUserId: claims.sub,
        email: localUser.email,
        sessionId: claims.sid,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired session.');
    }
  }
}
