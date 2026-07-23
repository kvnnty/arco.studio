import { auth } from '@clerk/nextjs/server';
import { cache } from 'react';

import { ApiError, createApiClient } from '@/lib/api/axios';
import type { ProductUser } from '@/lib/auth/constants';

const PROVISION_MAX_ATTEMPTS = 8;
const PROVISION_RETRY_MS = 400;

export async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session.userId) return null;
  return session.getToken();
}

async function fetchProductUser(token: string): Promise<ProductUser | null> {
  try {
    const client = createApiClient(token);
    const { data } = await client.get<ProductUser>('/users/me');
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

async function readAuthenticatedUser(): Promise<ProductUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return fetchProductUser(token);
}

export const getAuthenticatedUser = cache(readAuthenticatedUser);

/**
 * Resolve the Arco product user. Retries when Clerk is signed in but the API
 * user is not provisioned yet (local dev / webhook delay).
 */
export async function resolveProductUser(options?: {
  maxAttempts?: number;
  retryMs?: number;
}): Promise<ProductUser | null> {
  const maxAttempts = options?.maxAttempts ?? PROVISION_MAX_ATTEMPTS;
  const retryMs = options?.retryMs ?? PROVISION_RETRY_MS;

  const user = await getAuthenticatedUser();
  if (user) return user;

  const { userId, getToken } = await auth();
  if (!userId) return null;

  for (let attempt = 2; attempt <= maxAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, retryMs));
    const token = await getToken();
    if (!token) continue;
    const provisioned = await fetchProductUser(token);
    if (provisioned) return provisioned;
  }

  return null;
}

export async function requireAuthenticatedUser(): Promise<ProductUser> {
  const user = await resolveProductUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}
