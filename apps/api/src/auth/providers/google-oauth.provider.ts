import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthProvider } from './oauth-provider.interface.js';

type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

@Injectable()
export class GoogleOAuthProvider implements OAuthProvider {
  readonly id = 'google';

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get('GOOGLE_CLIENT_ID') &&
        this.config.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = this.requireClientId();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string) {
    const clientId = this.requireClientId();
    const clientSecret = this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Google sign-in failed.');
    }

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
    const profileResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    );

    if (!profileResponse.ok) {
      throw new UnauthorizedException('Could not load Google profile.');
    }

    const profile = (await profileResponse.json()) as GoogleUserInfo;
    if (!profile.email) {
      throw new UnauthorizedException('Google account has no email address.');
    }

    return {
      providerUserId: profile.sub,
      email: profile.email,
      emailVerified: profile.email_verified ?? true,
      name: profile.name,
      metadata: { picture: profile.picture },
    };
  }

  private requireClientId(): string {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException('Google OAuth is not configured.');
    }
    return clientId;
  }
}
