import type { ArcoProject } from "./index.js";

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
    },
    audioId: "modern-saas",
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
    },
    audioId: "modern-saas",
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
    },
    audioId: "modern-saas",
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
    },
    audioId: "modern-saas",
  },
};

export function applyStylePreset(
  project: ArcoProject,
  preset: StylePreset,
): ArcoProject {
  const config = STYLE_PRESETS[preset];
  return {
    ...project,
    stylePreset: preset,
    brand: { ...config.brand },
    audio: { musicId: config.audioId, volume: 0.85 },
  };
}
