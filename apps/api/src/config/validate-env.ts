import { Logger } from '@nestjs/common';

function isSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

export function validateEnv(): void {
  const logger = new Logger('EnvValidation');
  const isProd = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  const required = [
    'CLERK_SECRET_KEY',
    'CLERK_AUTHORIZED_PARTIES',
    'DATABASE_URL',
    'WEB_APP_URL',
    'API_PUBLIC_URL',
    'CORS_ORIGIN',
  ] as const;

  for (const key of required) {
    if (!isSet(key)) errors.push(key);
  }

  if (!isSet('CLERK_JWT_KEY')) {
    warnings.push(
      'CLERK_JWT_KEY not set — API will verify session tokens via Clerk JWKS (secretKey)',
    );
  }

  if (
    !isSet('S3_BUCKET') ||
    !isSet('S3_ACCESS_KEY') ||
    !isSet('S3_SECRET_KEY')
  ) {
    warnings.push('S3 storage (uploads/renders may fail)');
  }

  for (const warning of warnings) logger.warn(warning);

  if (errors.length > 0) {
    const message = `Missing environment: ${errors.join(', ')}`;
    if (isProd) throw new Error(message);
    logger.error(message);
    return;
  }

  logger.log('Environment OK - authentication is delegated to Clerk.');
}
