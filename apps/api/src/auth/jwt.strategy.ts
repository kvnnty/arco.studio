import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { SessionService } from './services/session.service.js';
import type { AccessTokenPayload } from './services/token.service.js';

function extractJwt(req: Request): string | null {
  const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (bearer) return bearer;

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('arco_access_token='));

  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly sessions: SessionService) {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'arco-dev-secret',
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    await this.sessions.assertSessionActive(payload.sid, payload.sub);
    await this.sessions.touchSession(payload.sid);

    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
    };
  }
}
