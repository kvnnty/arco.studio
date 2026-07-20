import {
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
  assert.ok(
    report.findings.some((finding) => finding.code === "generic-copy"),
  );
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
