/**
 * Extension point for future SSO providers (Google, GitHub, Microsoft, SAML, OIDC).
 * Implement this interface and register providers in AuthModule when adding OAuth.
 */
export interface OAuthProvider {
  readonly id: string;
  isConfigured(): boolean;
  getAuthorizationUrl(state: string, redirectUri: string): string;
  exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<{
    providerUserId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    metadata?: Record<string, unknown>;
  }>;
}

export const OAUTH_PROVIDER_IDS = [
  'google',
  'github',
  'microsoft',
  'saml',
  'oidc',
] as const;

export type OAuthProviderId = (typeof OAUTH_PROVIDER_IDS)[number];
