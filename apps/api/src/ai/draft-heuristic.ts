import {
  DEFAULT_FOCUS,
  effectsFromClickEffect,
  type ClickEffect,
  type Marker,
  type StylePreset,
} from '@arco/project-schema';
import { randomUUID } from 'node:crypto';

const DRAFT_LABELS = [
  'Dashboard opened',
  'Analytics viewed',
  'Report generated',
  'Settings updated',
  'Feature explored',
];

const DRAFT_CALLOUTS = [
  { text: 'See every metric instantly', subtext: 'Understand what drives growth' },
  { text: 'Understand what drives growth', subtext: 'Real-time insights' },
  { text: 'Make better decisions', subtext: 'Data you can act on' },
  { text: 'Ship with confidence', subtext: 'Built for modern teams' },
];

const DRAFT_CLICK_EFFECTS: ClickEffect[] = [
  'ripple',
  'zoom',
  'ripple',
  'spotlight',
];

function createMarkerId(): string {
  return `m-${randomUUID().slice(0, 8)}`;
}

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

export function generateHeuristicDraftMarkers(durationMs: number): Marker[] {
  const count = Math.min(5, Math.max(3, Math.floor(durationMs / 8000)));
  const times = pickMarkerTimes(durationMs, count);

  return times.map((startMs, index) => {
    const clickEffect = DRAFT_CLICK_EFFECTS[index % DRAFT_CLICK_EFFECTS.length] ?? 'ripple';
    const callout = DRAFT_CALLOUTS[index % DRAFT_CALLOUTS.length]!;
    const effects = [
      ...effectsFromClickEffect(clickEffect, 1.15),
      { type: 'title-card' as const },
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
          ? { type: 'fade' as const }
          : index % 2 === 0
            ? { type: 'slide' as const }
            : { type: 'scale' as const },
    };
  });
}

type DraftSceneInput = {
  startMs: number;
  durationMs?: number;
  label?: string;
  callout?: { text: string; subtext?: string };
  clickEffect?: ClickEffect;
};

export function scenesToMarkers(
  scenes: DraftSceneInput[],
  durationMs: number,
): Marker[] {
  if (scenes.length === 0) {
    return generateHeuristicDraftMarkers(durationMs);
  }

  return scenes.map((scene, index) => {
    const clickEffect = scene.clickEffect ?? 'ripple';
    const callout = scene.callout ?? {
      text: scene.label ?? DRAFT_CALLOUTS[index % DRAFT_CALLOUTS.length]!.text,
    };

    return {
      id: createMarkerId(),
      startMs: Math.max(0, Math.min(scene.startMs, durationMs - 500)),
      durationMs: scene.durationMs ?? 2200,
      effects: [
        ...effectsFromClickEffect(clickEffect, 1.15),
        { type: 'title-card' as const },
      ],
      label: scene.label ?? callout.text,
      callout,
      focus: pickFocus(index),
      click: pickClick(index),
      clickEffect,
      transition:
        index === 0
          ? { type: 'fade' as const }
          : index % 2 === 0
            ? { type: 'slide' as const }
            : { type: 'scale' as const },
    };
  });
}

export const VALID_STYLE_PRESETS: StylePreset[] = [
  'linear',
  'stripe',
  'apple',
  'startup',
];

export function normalizeStylePreset(value: unknown): StylePreset {
  if (
    typeof value === 'string' &&
    VALID_STYLE_PRESETS.includes(value as StylePreset)
  ) {
    return value as StylePreset;
  }
  return 'startup';
}

export { DEFAULT_FOCUS };
