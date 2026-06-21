export const AUTH_AUDIT_EVENTS = {
  MAGIC_LINK_REQUESTED: 'magic_link.requested',
  MAGIC_LINK_VERIFIED: 'magic_link.verified',
  MAGIC_LINK_FAILED: 'magic_link.failed',
  PASSWORD_LOGIN_SUCCESS: 'password.login.success',
  PASSWORD_LOGIN_FAILED: 'password.login.failed',
  PASSWORD_REGISTER: 'password.register',
  PASSWORD_SET: 'password.set',
  PASSWORD_RESET_REQUESTED: 'password.reset.requested',
  PASSWORD_RESET_COMPLETED: 'password.reset.completed',
  TOKEN_REFRESH: 'token.refresh',
  TOKEN_REFRESH_REUSE: 'token.refresh.reuse_detected',
  LOGOUT: 'logout',
  LOGOUT_ALL: 'logout.all',
  SESSION_REVOKED: 'session.revoked',
  SUSPICIOUS_LOGIN: 'security.suspicious_login',
  RATE_LIMITED: 'security.rate_limited',
  OAUTH_LOGIN_SUCCESS: 'oauth.login.success',
  OAUTH_LOGIN_FAILED: 'oauth.login.failed',
} as const;

export const MAGIC_LINK_PURPOSES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  EMAIL_VERIFY: 'email_verify',
  PASSWORD_RESET: 'password_reset',
  OAUTH_COMPLETE: 'oauth_complete',
} as const;

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
export const BCRYPT_ROUNDS = 12;

export const RATE_LIMITS = {
  magicLinkPerEmail: { max: 5, windowMs: 60 * 60 * 1000 },
  magicLinkPerIp: { max: 20, windowMs: 60 * 60 * 1000 },
  loginPerIp: { max: 10, windowMs: 15 * 60 * 1000 },
  loginPerEmail: { max: 5, windowMs: 15 * 60 * 1000 },
  refreshPerSession: { max: 30, windowMs: 15 * 60 * 1000 },
} as const;

export type AuthContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    onboardingStep: string;
  };
};
