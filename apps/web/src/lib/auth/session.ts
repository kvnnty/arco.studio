import { auth } from '@clerk/nextjs/server';
import { cache } from 'react';

import { ApiError, createApiClient } from '@/lib/api/axios';
import type { ProductUser } from '@/lib/auth/constants';

const PRODUCT_USER_ATTEMPTS = 3;
const PRODUCT_USER_RETRY_MS = 400;

export async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session.userId) return null;
  return session.getToken();
}

function isTransientApiError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 503) return true;
  return /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ECONNABORTED|socket hang up|timeout/i.test(
    error.message,
  );
}

async function fetchProductUser(token: string): Promise<ProductUser | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PRODUCT_USER_ATTEMPTS; attempt++) {
    try {
      const client = createApiClient(token);
      const { data } = await client.get<ProductUser>('/users/me');
      return data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      lastError = error;
      if (!isTransientApiError(error) || attempt === PRODUCT_USER_ATTEMPTS) {
        break;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, PRODUCT_USER_RETRY_MS * attempt),
      );
    }
  }

  // Nest --watch restarts briefly refuse connections; don't hard-crash the page.
  if (isTransientApiError(lastError)) return null;
  throw lastError;
}

async function readAuthenticatedUser(): Promise<ProductUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return fetchProductUser(token);
}

export const getAuthenticatedUser = cache(readAuthenticatedUser);

export async function requireAuthenticatedUser(): Promise<ProductUser> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}
