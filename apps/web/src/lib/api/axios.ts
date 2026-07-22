import axios, { isAxiosError, type AxiosInstance } from "axios";

import { getRequestApiUrl } from "@/lib/api/config";
import type { AccessTokenSource } from "@/lib/auth/constants";

const API_TIMEOUT_MS = 8_000;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "Request failed";
  }

  const payload = error.response?.data as
    | { message?: string | string[] }
    | undefined;

  if (typeof payload?.message === "string") return payload.message;
  if (Array.isArray(payload?.message)) return payload.message.join(", ");

  return error.response?.statusText ?? error.message ?? "Request failed";
}

export async function resolveAccessToken(
  source?: AccessTokenSource,
): Promise<string | null> {
  if (!source) return null;
  return typeof source === "function" ? source() : source;
}

export function createApiClient(token?: AccessTokenSource): AxiosInstance {
  const client = axios.create({
    baseURL: getRequestApiUrl(),
    timeout: API_TIMEOUT_MS,
    headers:
      typeof token === "string"
        ? { Authorization: `Bearer ${token}` }
        : undefined,
  });

  if (typeof token === "function") {
    client.interceptors.request.use(async (config) => {
      const resolved = await token();
      if (!resolved) throw new ApiError(401, "Authentication required");
      config.headers.set("Authorization", `Bearer ${resolved}`);
      return config;
    });
  }

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isAxiosError(error)) {
        throw new ApiError(
          error.response?.status ?? 500,
          extractErrorMessage(error),
        );
      }
      throw error;
    },
  );

  return client;
}

export function createWebApiClient(): AxiosInstance {
  return axios.create({
    timeout: API_TIMEOUT_MS,
    withCredentials: true,
  });
}
