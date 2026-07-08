import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthProvider } from './oauth-provider.interface';

type GitHubTokenResponse = {
  access_token: string;
  token_type: string;
};

type GitHubUser = {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

@Injectable()
export class GitHubOAuthProvider implements OAuthProvider {
  readonly id = 'github';

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get('GITHUB_CLIENT_ID') &&
      this.config.get('GITHUB_CLIENT_SECRET'),
    );
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = this.requireClientId();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string) {
    const clientId = this.requireClientId();
    const clientSecret = this.config.getOrThrow<string>('GITHUB_CLIENT_SECRET');

    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('GitHub sign-in failed.');
    }

    const tokens = (await tokenResponse.json()) as GitHubTokenResponse & {
      error?: string;
    };
    if (!tokens.access_token || tokens.error) {
      throw new UnauthorizedException('GitHub sign-in failed.');
    }

    const headers = {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Arco-App',
    };

    const profileResponse = await fetch('https://api.github.com/user', {
      headers,
    });
    if (!profileResponse.ok) {
      throw new UnauthorizedException('Could not load GitHub profile.');
    }

    const profile = (await profileResponse.json()) as GitHubUser;
    let email = profile.email ?? undefined;
    let emailVerified = Boolean(email);

    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers,
      });
      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as GitHubEmail[];
        const primary =
          emails.find((item) => item.primary && item.verified) ??
          emails.find((item) => item.verified) ??
          emails[0];
        email = primary?.email;
        emailVerified = primary?.verified ?? false;
      }
    }

    if (!email) {
      throw new UnauthorizedException(
        'GitHub account has no public email. Make one primary in GitHub settings.',
      );
    }

    return {
      providerUserId: String(profile.id),
      email,
      emailVerified,
      name: profile.name ?? profile.login,
      metadata: {
        login: profile.login,
        avatar_url: profile.avatar_url,
      },
    };
  }

  private requireClientId(): string {
    const clientId = this.config.get<string>('GITHUB_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException('GitHub OAuth is not configured.');
    }
    return clientId;
  }
}
