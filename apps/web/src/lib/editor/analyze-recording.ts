import type { Marker, StylePreset } from "@arco/project-schema";
import {
  DEFAULT_FOCUS,
  effectsFromClickEffect,
} from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";
import {
  applyTemplateBlueprint,
  buildTemplateContext,
  getTemplate,
} from "@arco/project-schema/templates";
import { apiGenerateDraft } from "@/lib/api/client";
import { createMarkerId } from "./create-project";

export type AnalysisStep = {
  id: string;
  label: string;
  durationMs: number;
};

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: "duration", label: "Reviewing recording length", durationMs: 700 },
  { id: "pacing", label: "Applying template pacing", durationMs: 800 },
  { id: "timings", label: "AI suggested timings", durationMs: 900 },
  { id: "copy", label: "Drafting headlines & callouts", durationMs: 900 },
  { id: "draft", label: "Building motion draft", durationMs: 900 },
];

const DRAFT_LABELS = [
  "Dashboard opened",
  "Analytics viewed",
  "Report generated",
  "Settings updated",
  "Feature explored",
];

const DRAFT_CALLOUTS = [
  { text: "See every metric instantly", subtext: "Understand what drives growth" },
  { text: "Understand what drives growth", subtext: "Real-time insights" },
  { text: "Make better decisions", subtext: "Data you can act on" },
  { text: "Ship with confidence", subtext: "Built for modern teams" },
];

const DRAFT_CLICK_EFFECTS = ["ripple", "zoom", "ripple", "spotlight"] as const;

function pickMarkerTimes(durationMs: number, count: number): number[] {
  const margin = Math.min(2000, durationMs * 0.08);
  const usable = Math.max(durationMs - margin * 2, 1000);
  const minGap = 3000;
  const maxByGap = Math.max(1, Math.floor(usable / minGap));
  const effectiveCount = Math.min(count, maxByGap);
  const step = usable / (effectiveCount + 1);
  return Array.from({ length: effectiveCount }, (_, i) =>
    Math.round(margin + step * (i + 1)),
  );
}

function pickFocus(index: number) {
  const cols = 2;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: 0.35 + col * 0.3,
    y: 0.35 + row * 0.22,
    width: 0.32,
    height: 0.28,
  };
}

function pickClick(index: number) {
  return {
    x: 0.38 + (index % 3) * 0.12,
    y: 0.42 + Math.floor(index / 3) * 0.1,
  };
}

export function generateDraftMarkers(durationMs: number): Marker[] {
  const count = Math.min(5, Math.max(3, Math.floor(durationMs / 8000)));
  const times = pickMarkerTimes(durationMs, count);

  return times.map((startMs, index) => {
    const clickEffect = DRAFT_CLICK_EFFECTS[index % DRAFT_CLICK_EFFECTS.length] ?? "ripple";
    const callout = DRAFT_CALLOUTS[index % DRAFT_CALLOUTS.length]!;
    const effects = [
      ...effectsFromClickEffect(clickEffect, 1.15),
      { type: "title-card" as const },
    ];

    return {
      id: createMarkerId(),
      startMs,
      durationMs: 2200,
      effects,
      label: DRAFT_LABELS[index % DRAFT_LABELS.length],
      callout,
      focus: pickFocus(index),
      click: pickClick(index),
      clickEffect,
      transition:
        index === 0
          ? { type: "fade" as const }
          : index % 2 === 0
            ? { type: "slide" as const }
            : { type: "scale" as const },
    };
  });
}

export function buildDraftProject(
  project: import("@arco/project-schema").ArcoProject,
  stylePreset: StylePreset = "startup",
  markers?: Marker[],
): import("@arco/project-schema").ArcoProject {
  const withStyle = applyStylePreset(project, stylePreset ?? "startup");
  return {
    ...withStyle,
    markers: markers ?? generateDraftMarkers(project.recording.durationMs),
    audio: { musicId: "modern-saas", volume: 0.85 },
  };
}

export type DraftAnalysisResult = {
  markers: Marker[];
  stylePreset: StylePreset;
  source: "llm" | "heuristic";
  brandKit?: import("@/lib/api/hooks/brand").BrandKit;
};

export async function runAnalysis(
  onStep: (stepIndex: number, detectedMarkers: Marker[]) => void,
  input: {
    accessToken: string;
    title: string;
    durationMs: number;
    platform?: string;
    intent?: string;
    productUrl?: string;
    templateId?: string;
    brandContext?: {
      title?: string;
      description?: string;
      tone?: string;
      colors?: { primary: string; background: string };
    };
  },
): Promise<DraftAnalysisResult> {
  const template = input.templateId ? getTemplate(input.templateId) : undefined;
  const templateContext = template ? buildTemplateContext(template) : undefined;

  const draftPromise = apiGenerateDraft(input.accessToken, {
    title: input.title,
    durationMs: input.durationMs,
    platform: input.platform,
    intent: input.intent,
    productUrl: input.productUrl,
    templateId: input.templateId,
    templateContext,
    brandContext: input.brandContext,
  }).catch(() => {
    if (template) {
      return {
        markers: applyTemplateBlueprint(template, input.durationMs, input.title),
        stylePreset: template.stylePreset,
        source: "heuristic" as const,
      };
    }
    return {
      markers: generateDraftMarkers(input.durationMs),
      stylePreset: "startup" as StylePreset,
      source: "heuristic" as const,
    };
  });

  let markers: Marker[] = [];

  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    await new Promise((resolve) =>
      setTimeout(resolve, ANALYSIS_STEPS[i]!.durationMs),
    );

    const draft = await draftPromise;
    if (i >= 2) {
      markers = draft.markers.slice(0, Math.max(1, i - 1));
    }
    onStep(i, markers);
  }

  return draftPromise;
}

export function getDefaultFocus() {
  return { ...DEFAULT_FOCUS };
}
