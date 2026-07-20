import {
  isScreenshotProject,
  parseArcoProject,
  type ArcoProject,
} from "@arco/project-schema";

import type { QualityFinding, QualityReport } from "./types.js";

const GENERIC_COPY =
  /\b(ai[- ]powered|game[- ]changer|next[- ]level|revolutionary|seamless experience|powerful platform|supercharge)\b/i;

function add(
  findings: QualityFinding[],
  finding: QualityFinding,
): void {
  findings.push(finding);
}

function qualityPenalty(severity: QualityFinding["severity"]): number {
  if (severity === "error") return 25;
  if (severity === "warning") return 7;
  return 2;
}

export function evaluateVideoQuality(input: ArcoProject): QualityReport {
  const project = parseArcoProject(input);
  const findings: QualityFinding[] = [];

  if (isScreenshotProject(project)) {
    const scenes = project.scenes ?? [];

    if (scenes.length === 0) {
      add(findings, {
        code: "missing-scenes",
        severity: "error",
        message: "A screenshot video needs at least one product scene.",
      });
    } else if (scenes.length < 3) {
      add(findings, {
        code: "thin-story",
        severity: "warning",
        message: "Use at least three beats to establish a hook, proof, and CTA.",
      });
    }

    const headlines = new Set<string>();
    let fadeCount = 0;
    let repeatedMotion = 0;
    let previousMotion: string | undefined;

    for (const scene of scenes) {
      const headline = scene.headline?.trim() ?? "";
      const subheadline = scene.subheadline?.trim() ?? "";

      if (!scene.imageSrc || scene.imageSrc === "pending") {
        add(findings, {
          code: "missing-product-visual",
          severity: "error",
          message: "Every scene must use a real product screenshot.",
          sceneId: scene.id,
        });
      }

      if (!headline) {
        add(findings, {
          code: "missing-headline",
          severity: "warning",
          message: "The scene needs one clear visual message.",
          sceneId: scene.id,
        });
      } else {
        const normalized = headline.toLowerCase();
        if (headlines.has(normalized)) {
          add(findings, {
            code: "duplicate-headline",
            severity: "warning",
            message: "Each scene should advance the story with a new message.",
            sceneId: scene.id,
          });
        }
        headlines.add(normalized);

        if (headline.length > 56) {
          add(findings, {
            code: "headline-too-long",
            severity: "warning",
            message: "Shorten the headline to preserve clean display typography.",
            sceneId: scene.id,
          });
        }
      }

      if (subheadline.length > 110) {
        add(findings, {
          code: "subheadline-too-long",
          severity: "warning",
          message: "Shorten supporting copy so the product remains the focal point.",
          sceneId: scene.id,
        });
      }

      if (GENERIC_COPY.test(`${headline} ${subheadline}`)) {
        add(findings, {
          code: "generic-copy",
          severity: "warning",
          message: "Replace generic AI marketing language with a concrete product truth.",
          sceneId: scene.id,
        });
      }

      if (scene.durationMs < 1800) {
        add(findings, {
          code: "beat-too-short",
          severity: "warning",
          message: "Give the scene enough time for the UI and copy to register.",
          sceneId: scene.id,
        });
      }

      if ((scene.transition?.type ?? "fade") === "fade") {
        fadeCount += 1;
      }

      if (scene.motion === previousMotion) {
        repeatedMotion += 1;
      }
      previousMotion = scene.motion;
    }

    if (scenes.length >= 4 && fadeCount / scenes.length > 0.6) {
      add(findings, {
        code: "transition-monotony",
        severity: "warning",
        message: "Vary transitions at story turns instead of fading every scene.",
      });
    }

    if (repeatedMotion >= 2) {
      add(findings, {
        code: "camera-monotony",
        severity: "warning",
        message: "Vary camera movement to give the sequence designed rhythm.",
      });
    }
  } else if (
    !project.recording.src ||
    project.recording.src === "pending" ||
    project.recording.src === "placeholder"
  ) {
    add(findings, {
      code: "missing-recording",
      severity: "error",
      message: "A recording project needs an uploaded recording.",
    });
  }

  const penalty = findings.reduce(
    (total, finding) => total + qualityPenalty(finding.severity),
    0,
  );
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    score,
    passed: !findings.some((finding) => finding.severity === "error"),
    findings,
  };
}
