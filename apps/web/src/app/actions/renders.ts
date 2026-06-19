"use server";

import { auth } from "@/auth";
import {
  apiCreateRender,
  apiGetRender,
  type RenderJobRecord,
} from "@/lib/api/client";

async function requireAccessToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }
  return session.accessToken;
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
