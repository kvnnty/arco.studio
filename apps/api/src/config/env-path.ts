import { join } from 'node:path';

/** Resolve .env files whether the process cwd is the repo root or apps/api. */
export function getEnvFilePaths(): string[] {
  const cwd = process.cwd();
  return [
    join(cwd, '.env'),
    join(cwd, 'apps/api/.env'),
    join(cwd, '.env.local'),
    join(cwd, 'apps/api/.env.local'),
  ];
}
