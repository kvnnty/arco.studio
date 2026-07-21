import {
  createHeuristicSoundDesign,
  createScreenshotPendingProject,
  type ArcoProject,
} from "@arco/project-schema";
import assert from "node:assert/strict";
import test from "node:test";

import { compileArcoVideo } from "./compile.js";
import { evaluateVideoQuality } from "./quality.js";

function screenshotProject(): ArcoProject {
  return {
    ...createScreenshotPendingProject("Ledger"),
    brief: {
      intent: "Launch the billing dashboard to startup finance teams.",
      productUrl: "https://ledger.example",
    },
    creativeDirection: {
      audience: "Startup finance teams",
      channel: "Product Hunt",
      tone: "Precise and assured",
      coreMessage: "See every subscription movement clearly.",
    },
    scenes: [
      {
        id: "hook",
        imageSrc: "https://cdn.example/hook.png",
        durationMs: 3000,
        headline: "Revenue, finally legible",
        subheadline: "See the movement behind every number.",
        motion: "ken-burns-in",
        transition: { type: "scale" },
        beatRole: "hook",
      },
      {
        id: "proof",
        imageSrc: "https://cdn.example/proof.png",
        durationMs: 3200,
        headline: "Trace every change",
        subheadline: "From upgrade to churn, without spreadsheet archaeology.",
        motion: "pan-left",
        transition: { type: "push" },
        beatRole: "proof",
      },
      {
        id: "cta",
        imageSrc: "https://cdn.example/cta.png",
        durationMs: 2800,
        headline: "Know what moved",
        subheadline: "Start with your live billing data.",
        motion: "ken-burns-out",
        transition: { type: "blur" },
        beatRole: "cta",
      },
    ],
    recording: {
      src: "placeholder",
      durationMs: 9000,
    },
    pipelineStatus: "ready",
  };
}

test("compiles a deterministic HyperFrames composition", () => {
  const compiled = compileArcoVideo(screenshotProject());

  assert.equal(compiled.durationSeconds, 9);
  assert.equal(compiled.quality.passed, true);
  assert.match(compiled.html, /data-composition-id="arco-main"/);
  assert.match(compiled.html, /data-no-timeline/);
  assert.match(compiled.html, /@font-face/);
  assert.match(compiled.html, /layout-kinetic-hook/);
  assert.match(compiled.html, /layout-cta-lockup/);
  assert.match(compiled.html, /window\.addEventListener\("hf-seek"/);
});

test("escapes user-authored copy", () => {
  const project = screenshotProject();
  project.scenes![0]!.headline = `<script>alert("no")</script>`;

  const compiled = compileArcoVideo(project);
  assert.doesNotMatch(compiled.html, /<script>alert/);
  assert.match(compiled.html, /&lt;script&gt;/);
});

test("quality gate flags generic marketing copy", () => {
  const project = screenshotProject();
  project.scenes![1]!.headline = "A revolutionary AI-powered platform";

  const report = evaluateVideoQuality(project);
  assert.ok(report.findings.some((finding) => finding.code === "generic-copy"));
});

test("resolves custom music inside the staged export bundle", () => {
  const project = screenshotProject();
  project.audio = {
    customMusicSrc: "music/custom.mp3",
    volume: 0.2,
  };

  const compiled = compileArcoVideo(project, {
    assetBaseUrl: "assets",
    mode: "export",
  });

  assert.match(compiled.html, /src="assets\/music\/custom\.mp3"/);
});

test("renders anchored motion sound and follows scene timing", () => {
  const project = screenshotProject();
  project.audio = {
    volume: 0.25,
    soundDesign: {
      version: "1",
      decision: "include",
      rationale: "One transition earns a quiet accent.",
      profile: "minimal",
      masterVolume: 0.6,
      cues: [
        {
          id: "proof-shift",
          soundId: "air-soft",
          category: "whoosh",
          startMs: 3000,
          anchor: {
            type: "scene",
            targetId: "proof",
            offsetMs: 120,
            followTiming: true,
          },
          volume: 0.4,
          intensity: 0.35,
          enabled: true,
          source: "ai",
        },
      ],
    },
  };
  project.scenes![0]!.durationMs = 4200;

  const compiled = compileArcoVideo(project, {
    assetBaseUrl: "assets",
    mode: "export",
  });

  assert.match(compiled.html, /data-audio-role="motion-sound"/);
  assert.match(compiled.html, /data-start="4\.32"/);
  assert.match(compiled.html, /src="assets\/sounds\/air-soft\.wav"/);
});

test("an explicit silence decision renders no motion sounds", () => {
  const project = screenshotProject();
  project.audio = {
    volume: 0.25,
    soundDesign: {
      version: "1",
      decision: "silence",
      rationale: "The quiet visual language is stronger without effects.",
      profile: "minimal",
      masterVolume: 0.6,
      cues: [],
    },
  };

  const compiled = compileArcoVideo(project);
  assert.doesNotMatch(compiled.html, /data-audio-role="motion-sound"/);
});

test("sound fallback chooses silence for visually quiet motion", () => {
  const project = screenshotProject();
  project.scenes = project.scenes?.map((scene) => ({
    ...scene,
    motion: "static" as const,
    transition: { type: "fade" as const },
  }));

  const plan = createHeuristicSoundDesign(project, "minimal");

  assert.equal(plan.decision, "silence");
  assert.deepEqual(plan.cues, []);
  assert.match(plan.rationale, /silence preserves clarity/i);
});
