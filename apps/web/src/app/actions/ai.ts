"use server";

import type { ArcoProject, Marker, StylePreset } from "@arco/project-schema";

import { auth } from "@/auth";
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
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return apiGenerateDraft(session.accessToken, input);
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
}): Promise<{
  callout: { text: string; subtext?: string };
  label?: string;
  source: "llm" | "heuristic";
}> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return apiRegenerateMarker(session.accessToken, input);
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
}): Promise<{
  markers: Array<{ callout: { text: string; subtext?: string }; label?: string }>;
  source: "llm" | "heuristic";
}> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return apiRefineProject(session.accessToken, input);
}

export async function chatProjectAction(input: {
  projectId: string;
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  project: {
    title: string;
    stylePreset?: string;
    durationMs: number;
    intent?: string;
    productUrl?: string;
    markers: Array<{
      id: string;
      startMs: number;
      durationMs: number;
      label?: string;
      callout?: { text: string; subtext?: string };
    }>;
    selectedMarkerIndex?: number;
    playheadMs?: number;
  };
}): Promise<{
  action: Record<string, unknown>;
  message: string;
  source: "llm" | "heuristic";
}> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return apiChat(session.accessToken, input);
}
