import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_TTL } from '../auth.constants';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  sid: string;
  type: 'access';
};

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
    return this.jwt.sign(
      { ...payload, type: 'access' satisfies AccessTokenPayload['type'] },
      { expiresIn: ACCESS_TOKEN_TTL },
    );
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = this.jwt.verify<AccessTokenPayload>(token);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  getAccessTokenTtlSeconds(): number {
    return 15 * 60;
  }
}
