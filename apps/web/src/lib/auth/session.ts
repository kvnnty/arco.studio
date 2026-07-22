import { auth } from '@clerk/nextjs/server';
import { cache } from 'react';

import { ApiError, createApiClient } from '@/lib/api/axios';
import type { ProductUser } from '@/lib/auth/constants';

export async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session.userId) return null;
  return session.getToken();
}

async function readAuthenticatedUser(): Promise<ProductUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const client = createApiClient(token);
    const { data } = await client.get<ProductUser>('/users/me');
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export const getAuthenticatedUser = cache(readAuthenticatedUser);

export async function requireAuthenticatedUser(): Promise<ProductUser> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}
