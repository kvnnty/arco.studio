import { Logger } from '@nestjs/common';

const INSECURE_JWT_SECRETS = new Set([
  'change-me-in-production',
  'arco-dev-secret',
]);

function isSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function oauthConfigured(prefix: 'GOOGLE' | 'GITHUB'): boolean {
  return isSet(`${prefix}_CLIENT_ID`) && isSet(`${prefix}_CLIENT_SECRET`);
}

export function validateEnv(): void {
  const logger = new Logger('EnvValidation');
  const isProd = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  const required = [
    'JWT_SECRET',
    'DATABASE_URL',
    'WEB_APP_URL',
    'API_PUBLIC_URL',
    'CORS_ORIGIN',
  ] as const;

  for (const key of required) {
    if (!isSet(key)) {
      errors.push(key);
    }
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (jwtSecret) {
    if (INSECURE_JWT_SECRETS.has(jwtSecret)) {
      const message = 'JWT_SECRET is using an insecure default';
      if (isProd) errors.push(message);
      else warnings.push(message);
    } else if (jwtSecret.length < 32 && isProd) {
      warnings.push('JWT_SECRET should be at least 32 characters in production');
    }
  }

  if (!isSet('RESEND_API_KEY')) {
    warnings.push('RESEND_API_KEY (magic-link email delivery disabled)');
  }

  for (const provider of ['GOOGLE', 'GITHUB'] as const) {
    const hasId = isSet(`${provider}_CLIENT_ID`);
    const hasSecret = isSet(`${provider}_CLIENT_SECRET`);
    if (hasId !== hasSecret) {
      warnings.push(`${provider} OAuth is partially configured`);
    } else if (!hasId) {
      warnings.push(`${provider} OAuth (provider disabled)`);
    }
  }

  if (!isSet('S3_BUCKET') || !isSet('S3_ACCESS_KEY') || !isSet('S3_SECRET_KEY')) {
    warnings.push('S3 storage (uploads/renders may fail)');
  }

  for (const warning of warnings) {
    logger.warn(warning);
  }

  if (errors.length > 0) {
    const message = `Missing or invalid environment: ${errors.join(', ')}`;
    if (isProd) {
      throw new Error(message);
    }
    logger.error(message);
  } else {
    logger.log(
      `Environment OK — OAuth: google=${oauthConfigured('GOOGLE')}, github=${oauthConfigured('GITHUB')}, email=${isSet('RESEND_API_KEY')}`,
    );
  }
}
