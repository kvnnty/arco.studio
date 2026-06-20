import type { ArcoProject, Marker, StylePreset } from "@arco/project-schema";
import { applyStylePreset } from "@arco/project-schema/style-presets";

import { createDefaultMarker } from "@/lib/editor/create-project";

export type ChatAction =
  | { type: "reply"; message: string }
  | { type: "refine_all_copy"; markers: Marker[] }
  | {
      type: "regenerate_marker";
      markerIndex: number;
      callout: { text: string; subtext?: string };
      label?: string;
    }
  | { type: "update_style_preset"; stylePreset: StylePreset }
  | { type: "add_marker_at_ms"; startMs: number }
  | { type: "delete_marker"; markerIndex: number };

export function applyChatAction(
  project: ArcoProject,
  action: ChatAction,
): { project: ArcoProject; message: string } {
  switch (action.type) {
    case "reply":
      return { project, message: action.message };

    case "refine_all_copy":
      return {
        project: { ...project, markers: action.markers },
        message: `Updated copy across ${action.markers.length} scenes.`,
      };

    case "regenerate_marker": {
      const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
      const target = sorted[action.markerIndex];
      if (!target) {
        return { project, message: "Could not find that scene." };
      }
      const markers = project.markers.map((marker) =>
        marker.id === target.id
          ? {
              ...marker,
              callout: action.callout,
              label: action.label ?? action.callout.text,
            }
          : marker,
      );
      return {
        project: { ...project, markers },
        message: `Regenerated scene ${action.markerIndex + 1}.`,
      };
    }

    case "update_style_preset":
      return {
        project: applyStylePreset(project, action.stylePreset),
        message: `Applied ${action.stylePreset} style preset.`,
      };

    case "add_marker_at_ms": {
      const marker = createDefaultMarker(action.startMs);
      return {
        project: { ...project, markers: [...project.markers, marker] },
        message: `Added a scene at ${Math.round(action.startMs / 1000)}s.`,
      };
    }

    case "delete_marker": {
      const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
      const target = sorted[action.markerIndex];
      if (!target) {
        return { project, message: "Could not find that scene." };
      }
      return {
        project: {
          ...project,
          markers: project.markers.filter((m) => m.id !== target.id),
        },
        message: `Removed scene ${action.markerIndex + 1}.`,
      };
    }

    default:
      return { project, message: "Done." };
  }
}

export function mergeRefinedMarkers(
  project: ArcoProject,
  refined: Array<{
    callout?: { text: string; subtext?: string };
    label?: string;
  }>,
): Marker[] {
  const sorted = [...project.markers].sort((a, b) => a.startMs - b.startMs);
  return sorted.map((marker, index) => {
    const update = refined[index];
    if (!update?.callout?.text) return marker;
    return {
      ...marker,
      callout: update.callout,
      label: update.label ?? update.callout.text,
    };
  });
}
