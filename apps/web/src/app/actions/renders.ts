"use server";

import { getAccessToken } from "@/lib/auth/session";
import {
  apiCreateRender,
  apiGetRender,
  type RenderJobRecord,
} from "@/lib/api/client";

async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return token;
}

export async function createRenderJob(input: {
  projectId: string;
  format: string;
}): Promise<RenderJobRecord> {
  const token = await requireAccessToken();
  return apiCreateRender(token, input);
}

export async function getRenderJob(jobId: string): Promise<RenderJobRecord> {
  const token = await requireAccessToken();
  return apiGetRender(token, jobId);
}
