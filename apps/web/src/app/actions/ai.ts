"use server";

import type { Marker, StylePreset } from "@arco/project-schema";

import { auth } from "@/auth";
import { apiGenerateDraft } from "@/lib/api/client";

export async function generateDraftAction(input: {
  title: string;
  durationMs: number;
  platform?: string;
  intent?: string;
  productUrl?: string;
}): Promise<{
  markers: Marker[];
  stylePreset: StylePreset;
  source: "llm" | "heuristic";
}> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return apiGenerateDraft(session.accessToken, input);
}
