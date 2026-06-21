import { createHash, randomBytes } from 'node:crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function deviceLabelFromUserAgent(userAgent?: string): string | null {
  if (!userAgent) return null;
  if (/iPhone|iPad/i.test(userAgent)) return 'iOS device';
  if (/Android/i.test(userAgent)) return 'Android device';
  if (/Macintosh/i.test(userAgent)) return 'Mac';
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Unknown device';
}

export function fingerprintLogin(userAgent?: string, ipAddress?: string): string {
  return hashToken(`${userAgent ?? ''}|${ipAddress ?? ''}`);
}
