/**
 * Official Arco video templates.
 * Each template defines a motion recipe (scene blueprint) applied relative to recording duration.
 * Preview assets live in apps/web/public/templates/{id}.mp4 and {id}-poster.jpg
 */
import type {
  ArcoProject,
  ClickEffect,
  ExportFormat,
  Marker,
  StylePreset,
  TransitionType,
} from "./index.js";
import {
  DEFAULT_FOCUS,
  effectsFromClickEffect,
  getExportDimensions,
} from "./index.js";
import { STYLE_PRESETS } from "./style-presets.js";

export type TemplateSceneBlueprint = {
  startRatio: number;
  durationRatio: number;
  clickEffect: ClickEffect;
  transition: TransitionType;
  hasTitleCard: boolean;
  calloutHint: string;
};

export type ArcoTemplate = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  previewVideoUrl: string;
  previewPosterUrl: string;
  stylePreset: StylePreset;
  exportFormat: ExportFormat;
  audio: { musicId: string; volume: number };
  sceneBlueprint: TemplateSceneBlueprint[];
  copyTone: string;
};

function blueprint(
  scenes: TemplateSceneBlueprint[],
): TemplateSceneBlueprint[] {
  return scenes;
}

export const ARCO_TEMPLATES: ArcoTemplate[] = [
  {
    id: "saas-launch",
    name: "SaaS Launch",
    description: "Classic launch film — intro title, feature beats, CTA close.",
    tags: ["SaaS", "Launch"],
    previewVideoUrl: "/templates/saas-launch-poster.svg",
    previewPosterUrl: "/templates/saas-launch-poster.svg",
    stylePreset: "startup",
    exportFormat: "16:9",
    audio: { musicId: "modern-saas", volume: 0.85 },
    copyTone: "Confident, minimal, devtool audience. Short punchy headlines.",
    sceneBlueprint: blueprint([
      {
        startRatio: 0.07,
        durationRatio: 0.17,
        clickEffect: "none",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "{product} — ship faster",
      },
      {
        startRatio: 0.29,
        durationRatio: 0.15,
        clickEffect: "ripple",
        transition: "slide",
        hasTitleCard: false,
        calloutHint: "One-click {feature}",
      },
      {
        startRatio: 0.58,
        durationRatio: 0.17,
        clickEffect: "zoom",
        transition: "scale",
        hasTitleCard: false,
        calloutHint: "Real-time {benefit}",
      },
      {
        startRatio: 0.83,
        durationRatio: 0.13,
        clickEffect: "none",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Start free today",
      },
    ]),
  },
  {
    id: "dev-tool",
    name: "Dev Tool Demo",
    description: "Linear-style precision — subtle zooms, technical copy, dark palette.",
    tags: ["SaaS", "Dev tool"],
    previewVideoUrl: "/templates/dev-tool-poster.svg",
    previewPosterUrl: "/templates/dev-tool-poster.svg",
    stylePreset: "linear",
    exportFormat: "16:9",
    audio: { musicId: "modern-saas", volume: 0.8 },
    copyTone: "Technical, precise, engineer-friendly. No hype.",
    sceneBlueprint: blueprint([
      {
        startRatio: 0.1,
        durationRatio: 0.18,
        clickEffect: "zoom",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Built for developers",
      },
      {
        startRatio: 0.35,
        durationRatio: 0.16,
        clickEffect: "zoom",
        transition: "push",
        hasTitleCard: false,
        calloutHint: "Debug in seconds",
      },
      {
        startRatio: 0.6,
        durationRatio: 0.16,
        clickEffect: "spotlight",
        transition: "blur",
        hasTitleCard: false,
        calloutHint: "Ship with confidence",
      },
    ]),
  },
  {
    id: "mobile-app",
    name: "Mobile App Tour",
    description: "Vertical format with ripple taps and swipe-friendly pacing.",
    tags: ["Mobile", "Launch"],
    previewVideoUrl: "/templates/mobile-app-poster.svg",
    previewPosterUrl: "/templates/mobile-app-poster.svg",
    stylePreset: "apple",
    exportFormat: "9:16",
    audio: { musicId: "modern-saas", volume: 0.85 },
    copyTone: "Clean, consumer-friendly, benefit-led.",
    sceneBlueprint: blueprint([
      {
        startRatio: 0.08,
        durationRatio: 0.14,
        clickEffect: "ripple",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "{product} on the go",
      },
      {
        startRatio: 0.3,
        durationRatio: 0.15,
        clickEffect: "ripple",
        transition: "slide",
        hasTitleCard: false,
        calloutHint: "Tap to {action}",
      },
      {
        startRatio: 0.55,
        durationRatio: 0.15,
        clickEffect: "pulse",
        transition: "scale",
        hasTitleCard: false,
        calloutHint: "Stay in sync",
      },
      {
        startRatio: 0.78,
        durationRatio: 0.12,
        clickEffect: "none",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Download now",
      },
    ]),
  },
  {
    id: "product-hunt",
    name: "Product Hunt",
    description: "Short 4-beat structure optimized for social and launch day.",
    tags: ["Launch", "Product Hunt"],
    previewVideoUrl: "/templates/product-hunt-poster.svg",
    previewPosterUrl: "/templates/product-hunt-poster.svg",
    stylePreset: "stripe",
    exportFormat: "16:9",
    audio: { musicId: "modern-saas", volume: 0.9 },
    copyTone: "Excited but credible. Hook → problem → solution → CTA.",
    sceneBlueprint: blueprint([
      {
        startRatio: 0.05,
        durationRatio: 0.12,
        clickEffect: "none",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Meet {product}",
      },
      {
        startRatio: 0.25,
        durationRatio: 0.14,
        clickEffect: "ripple",
        transition: "scale",
        hasTitleCard: false,
        calloutHint: "The problem we solved",
      },
      {
        startRatio: 0.5,
        durationRatio: 0.14,
        clickEffect: "zoom",
        transition: "slide",
        hasTitleCard: false,
        calloutHint: "See it in action",
      },
      {
        startRatio: 0.75,
        durationRatio: 0.12,
        clickEffect: "glow",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Upvote on Product Hunt",
      },
    ]),
  },
  {
    id: "feature-drop",
    name: "Feature Announcement",
    description: "Title-card heavy — perfect for changelog and release videos.",
    tags: ["SaaS", "Feature"],
    previewVideoUrl: "/templates/feature-drop-poster.svg",
    previewPosterUrl: "/templates/feature-drop-poster.svg",
    stylePreset: "startup",
    exportFormat: "16:9",
    audio: { musicId: "modern-saas", volume: 0.85 },
    copyTone: "Announce what's new. Lead with the feature name.",
    sceneBlueprint: blueprint([
      {
        startRatio: 0.06,
        durationRatio: 0.16,
        clickEffect: "none",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Introducing {feature}",
      },
      {
        startRatio: 0.32,
        durationRatio: 0.18,
        clickEffect: "spotlight",
        transition: "morph",
        hasTitleCard: false,
        calloutHint: "Why it matters",
      },
      {
        startRatio: 0.62,
        durationRatio: 0.16,
        clickEffect: "ripple",
        transition: "scale",
        hasTitleCard: false,
        calloutHint: "Try it now",
      },
    ]),
  },
  {
    id: "onboarding",
    name: "Onboarding Walkthrough",
    description: "Slower pacing for step-by-step product tours.",
    tags: ["SaaS", "Onboarding"],
    previewVideoUrl: "/templates/onboarding-poster.svg",
    previewPosterUrl: "/templates/onboarding-poster.svg",
    stylePreset: "apple",
    exportFormat: "16:9",
    audio: { musicId: "modern-saas", volume: 0.75 },
    copyTone: "Friendly, instructional, step-by-step.",
    sceneBlueprint: blueprint([
      {
        startRatio: 0.08,
        durationRatio: 0.2,
        clickEffect: "none",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "Welcome to {product}",
      },
      {
        startRatio: 0.28,
        durationRatio: 0.18,
        clickEffect: "ripple",
        transition: "fade",
        hasTitleCard: false,
        calloutHint: "Step 1 — Set up your workspace",
      },
      {
        startRatio: 0.52,
        durationRatio: 0.18,
        clickEffect: "ripple",
        transition: "fade",
        hasTitleCard: false,
        calloutHint: "Step 2 — Invite your team",
      },
      {
        startRatio: 0.76,
        durationRatio: 0.14,
        clickEffect: "spotlight",
        transition: "fade",
        hasTitleCard: true,
        calloutHint: "You're all set",
      },
    ]),
  },
];

export function listTemplates(): ArcoTemplate[] {
  return ARCO_TEMPLATES;
}

export function getTemplate(id: string): ArcoTemplate | undefined {
  return ARCO_TEMPLATES.find((t) => t.id === id);
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

function interpolateCalloutHint(hint: string, productTitle: string): string {
  const product = productTitle.replace(/\s+launch video$/i, "").trim() || "Your product";
  return hint
    .replace(/\{product\}/gi, product)
    .replace(/\{feature\}/gi, "workflow")
    .replace(/\{benefit\}/gi, "insights")
    .replace(/\{action\}/gi, "get started");
}

export function applyTemplateBlueprint(
  template: ArcoTemplate,
  durationMs: number,
  productTitle: string,
): Marker[] {
  const margin = Math.min(2000, durationMs * 0.05);
  const usable = Math.max(durationMs - margin * 2, 1000);

  return template.sceneBlueprint.map((scene, index) => {
    const startMs = Math.round(margin + usable * scene.startRatio);
    const durationFromRatio = Math.round(usable * scene.durationRatio);
    const sceneDurationMs = Math.max(1200, Math.min(durationFromRatio, 4000));

    const clickEffect = scene.clickEffect;
    const motionEffects = effectsFromClickEffect(
      clickEffect === "none" ? "zoom" : clickEffect,
      template.stylePreset === "linear" ? 1.12 : 1.15,
    );
    const effects = scene.hasTitleCard
      ? [{ type: "title-card" as const }, ...motionEffects]
      : motionEffects;

    const calloutText = interpolateCalloutHint(scene.calloutHint, productTitle);

    return {
      id: `m-template-${index}-${template.id}`,
      startMs: Math.min(startMs, Math.max(0, durationMs - sceneDurationMs - 200)),
      durationMs: sceneDurationMs,
      effects,
      callout: { text: calloutText },
      label: calloutText,
      focus: pickFocus(index),
      click: pickClick(index),
      clickEffect: clickEffect === "none" ? "zoom" : clickEffect,
      transition: { type: scene.transition },
    };
  });
}

export function applyTemplateToProject(
  project: ArcoProject,
  template: ArcoTemplate,
): ArcoProject {
  const presetConfig = STYLE_PRESETS[template.stylePreset];
  const dims = getExportDimensions(template.exportFormat);

  return {
    ...project,
    stylePreset: template.stylePreset,
    exportFormat: template.exportFormat,
    brand: { ...presetConfig.brand },
    audio: { ...template.audio },
    template: { id: template.id, name: template.name },
    meta: {
      ...project.meta,
      width: dims.width,
      height: dims.height,
    },
  };
}

export function mergeTemplateMotionOntoMarkers(
  markers: Marker[],
  template: ArcoTemplate,
): Marker[] {
  const blueprint = template.sceneBlueprint;

  return markers.map((marker, index) => {
    const scene = blueprint[index % blueprint.length];
    if (!scene) return marker;

    const clickEffect =
      scene.clickEffect === "none" ? "zoom" : scene.clickEffect;
    const motionEffects = effectsFromClickEffect(clickEffect, 1.15);
    const effects = scene.hasTitleCard
      ? [{ type: "title-card" as const }, ...motionEffects]
      : motionEffects;

    return {
      ...marker,
      clickEffect,
      effects,
      transition: { type: scene.transition },
      focus: marker.focus ?? { ...DEFAULT_FOCUS },
    };
  });
}

export function buildTemplateContext(template: ArcoTemplate) {
  return {
    name: template.name,
    copyTone: template.copyTone,
    sceneCount: template.sceneBlueprint.length,
    sceneHints: template.sceneBlueprint.map((s) => s.calloutHint),
    stylePreset: template.stylePreset,
  };
}
