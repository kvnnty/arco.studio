export const ACCESS_TOKEN_COOKIE = "arco_access_token";
export const REFRESH_TOKEN_COOKIE = "arco_refresh_token";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  onboardingStep: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: AuthUser;
};
