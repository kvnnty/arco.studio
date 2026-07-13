import type { ArcoProject, TransitionType } from "./index.js";

export const stylePresetSchema = [
  "linear",
  "stripe",
  "apple",
  "startup",
] as const;

export type StylePreset = (typeof stylePresetSchema)[number];

export type StylePresetConfig = {
  id: StylePreset;
  label: string;
  description: string;
  brand: { primary: string; background: string };
  motion: {
    zoomDefault: number;
    rippleIntensity: number;
    titleSize: number;
    easing: [number, number, number, number];
    /** Ken Burns / pan strength for screenshot mode (0.04–0.18). */
    kenBurnsAmplitude: number;
    defaultTransition: TransitionType;
    titleLayout: "bottom" | "card";
  };
  audioId: string;
};

export const STYLE_PRESETS: Record<StylePreset, StylePresetConfig> = {
  linear: {
    id: "linear",
    label: "Linear",
    description: "Clean, precise, minimal motion.",
    brand: { primary: "#5E6AD2", background: "#08090A" },
    motion: {
      zoomDefault: 1.12,
      rippleIntensity: 0.7,
      titleSize: 52,
      easing: [0.25, 0.1, 0.25, 1],
      kenBurnsAmplitude: 0.06,
      defaultTransition: "fade",
      titleLayout: "bottom",
    },
    audioId: "calm-focus",
  },
  stripe: {
    id: "stripe",
    label: "Stripe",
    description: "Elegant gradients and smooth pans.",
    brand: { primary: "#635BFF", background: "#0A2540" },
    motion: {
      zoomDefault: 1.15,
      rippleIntensity: 0.75,
      titleSize: 54,
      easing: [0.4, 0, 0.2, 1],
      kenBurnsAmplitude: 0.09,
      defaultTransition: "push",
      titleLayout: "bottom",
    },
    audioId: "bright-pulse",
  },
  apple: {
    id: "apple",
    label: "Apple",
    description: "Minimal, soft, cinematic.",
    brand: { primary: "#F5F5F7", background: "#000000" },
    motion: {
      zoomDefault: 1.08,
      rippleIntensity: 0.5,
      titleSize: 48,
      easing: [0.42, 0, 0.58, 1],
      kenBurnsAmplitude: 0.05,
      defaultTransition: "blur",
      titleLayout: "card",
    },
    audioId: "mountain-rise",
  },
  startup: {
    id: "startup",
    label: "Startup",
    description: "Energetic zooms and bold titles.",
    brand: { primary: "#55B3FF", background: "#07080A" },
    motion: {
      zoomDefault: 1.2,
      rippleIntensity: 0.9,
      titleSize: 56,
      easing: [0.34, 1.56, 0.64, 1],
      kenBurnsAmplitude: 0.14,
      defaultTransition: "scale",
      titleLayout: "bottom",
    },
    audioId: "launch-drive",
  },
};

/** Default mix level for curated library tracks. */
export const LIBRARY_MUSIC_VOLUME = 0.25;

export function applyStylePreset(
  project: ArcoProject,
  preset: StylePreset,
): ArcoProject {
  const config = STYLE_PRESETS[preset];
  const keepCustomMusic = Boolean(project.audio?.customMusicSrc);
  return {
    ...project,
    stylePreset: preset,
    brand: {
      ...config.brand,
      logoSrc: project.brand?.logoSrc,
    },
    audio: {
      ...project.audio,
      musicId: keepCustomMusic ? undefined : config.audioId,
      customMusicSrc: project.audio?.customMusicSrc,
      volume: project.audio?.volume ?? LIBRARY_MUSIC_VOLUME,
    },
  };
}
