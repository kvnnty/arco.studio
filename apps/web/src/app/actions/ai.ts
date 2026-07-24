"use server";

import type { Marker, StylePreset } from "@arco/project-schema";

import { requireAccessToken } from "@/lib/auth/session";
import {
  apiChat,
  apiGenerateDraft,
  apiRefineProject,
  apiRegenerateMarker,
} from "@/lib/api/client";

export async function generateDraftAction(input: {
  title: string;
  durationMs: number;
  platform?: string;
  intent?: string;
  productUrl?: string;
  brandContext?: {
    title?: string;
    description?: string;
    tone?: string;
    colors?: { primary: string; background: string };
  };
}): Promise<{
  markers: Marker[];
  stylePreset: StylePreset;
  source: "llm" | "heuristic";
}> {
  const token = await requireAccessToken();
  return apiGenerateDraft(token, input);
}

export async function regenerateMarkerAction(input: {
  title: string;
  durationMs: number;
  markerIndex: number;
  markerCount: number;
  intent?: string;
  productUrl?: string;
  marker: {
    label?: string;
    callout?: { text: string; subtext?: string };
    startMs: number;
  };
}) {
  const token = await requireAccessToken();
  return apiRegenerateMarker(token, input);
}

export async function refineProjectAction(input: {
  title: string;
  instruction: string;
  intent?: string;
  productUrl?: string;
  markers: Array<{
    label?: string;
    callout?: { text: string; subtext?: string };
    startMs: number;
  }>;
}) {
  const token = await requireAccessToken();
  return apiRefineProject(token, input);
}

export async function chatAction(input: Parameters<typeof apiChat>[1]) {
  const token = await requireAccessToken();
  return apiChat(token, input);
}

export const chatProjectAction = chatAction;
