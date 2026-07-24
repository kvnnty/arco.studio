"use server";

import { requireAccessToken } from "@/lib/auth/session";
import {
  apiCreateRender,
  apiGetRender,
  type RenderJobRecord,
} from "@/lib/api/client";

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
