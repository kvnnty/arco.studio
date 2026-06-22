import axios, { isAxiosError, type AxiosInstance } from "axios";

import { getApiUrl } from "@/lib/api/config";

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

export function createApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: getApiUrl(),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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
