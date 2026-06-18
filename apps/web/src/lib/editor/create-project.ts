import type { ArcoProject, Marker, MarkerEffect } from "@arco/project-schema";
import { DEFAULT_FOCUS } from "@arco/project-schema";

export type ProjectPlatform = "web" | "mobile" | "both";

export type JourneyStep =
  | "create"
  | "upload"
  | "analyzing"
  | "draft"
  | "edit";

export type EditorSession = {
  projectId: string;
  project: ArcoProject;
  platform: ProjectPlatform;
  recordingUrl: string;
  journeyStep: JourneyStep;
  projectName: string;
};

const SESSION_KEY = "arco-editor-session";

export function createProjectId(): string {
  return `p-${crypto.randomUUID().slice(0, 8)}`;
}

export function createMarkerId(): string {
  return `m-${crypto.randomUUID().slice(0, 8)}`;
}

export function createEmptyProject(
  title: string,
  recordingUrl: string,
  durationMs: number,
  width = 1920,
  height = 1080,
): ArcoProject {
  return {
    version: "1",
    meta: {
      title,
      fps: 30,
      width,
      height,
    },
    recording: {
      src: recordingUrl,
      durationMs,
    },
    markers: [],
    brand: {
      primary: "#55b3ff",
      background: "#07080a",
    },
    stylePreset: "startup",
    exportFormat: "16:9",
  };
}

export function createDefaultMarker(startMs: number): Marker {
  return {
    id: createMarkerId(),
    startMs,
    durationMs: 2000,
    effects: [
      { type: "smooth-zoom", scale: 1.15 },
      { type: "click-ripple", intensity: 0.85 },
    ],
    callout: { text: "New scene" },
    focus: { ...DEFAULT_FOCUS },
    click: { x: 0.5, y: 0.5 },
    clickEffect: "ripple",
    transition: { type: "fade" },
  };
}

export function getVideoMetadata(
  file: File,
): Promise<{ durationMs: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        durationMs: Math.round(video.duration * 1000),
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
      });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata"));
    };
    video.src = url;
  });
}

export function hasEffect(marker: Marker, type: MarkerEffect["type"]): boolean {
  return marker.effects.some((effect) => effect.type === type);
}

export function setEffect(
  marker: Marker,
  type: MarkerEffect["type"],
  enabled: boolean,
  defaults?: Partial<MarkerEffect>,
): Marker {
  const without = marker.effects.filter((effect) => effect.type !== type);
  if (!enabled) {
    return {
      ...marker,
      effects: without.length > 0 ? without : [{ type: "smooth-zoom", scale: 1 }],
    };
  }

  const existing = marker.effects.find((effect) => effect.type === type);
  const effect: MarkerEffect = existing ?? {
    type,
    ...defaults,
  };

  return {
    ...marker,
    effects: [...without, effect],
  };
}

export function inferJourneyStep(project: ArcoProject): JourneyStep {
  if (project.markers.length > 0) {
    return "edit";
  }

  const hasRecording =
    project.recording.src &&
    project.recording.src !== "pending" &&
    project.recording.durationMs > 0;

  if (hasRecording) {
    return "analyzing";
  }

  return "upload";
}

export function saveEditorSession(session: EditorSession): void {
  const recordingUrl =
    session.recordingUrl ||
    (session.project.recording.src !== "pending"
      ? session.project.recording.src
      : "");

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      project: session.project,
      platform: session.platform,
      recordingUrl,
      journeyStep: session.journeyStep,
      projectName: session.projectName,
      projectId: session.projectId,
    }),
  );
}

export function loadEditorSession(): EditorSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as EditorSession;
    const recordingUrl =
      parsed.recordingUrl ||
      (parsed.project.recording.src !== "pending"
        ? parsed.project.recording.src
        : "");

    if (!recordingUrl || recordingUrl === "pending") {
      if (parsed.journeyStep === "upload" || parsed.journeyStep === "create") {
        return {
          ...parsed,
          projectId: parsed.projectId,
          journeyStep: parsed.journeyStep,
          projectName: parsed.projectName ?? parsed.project.meta.title,
          recordingUrl: "",
          project: {
            ...parsed.project,
            stylePreset: parsed.project.stylePreset ?? "startup",
            exportFormat: parsed.project.exportFormat ?? "16:9",
          },
        };
      }
      return null;
    }

    return {
      ...parsed,
      projectId: parsed.projectId,
      journeyStep: parsed.journeyStep ?? inferJourneyStep(parsed.project),
      projectName: parsed.projectName ?? parsed.project.meta.title,
      recordingUrl,
      project: {
        ...parsed.project,
        stylePreset: parsed.project.stylePreset ?? "startup",
        exportFormat: parsed.project.exportFormat ?? "16:9",
        recording: {
          ...parsed.project.recording,
          src: recordingUrl,
        },
      },
    };
  } catch {
    return null;
  }
}

export function clearEditorSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
