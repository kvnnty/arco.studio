import {
  isScreenshotProject,
  parseArcoProject,
  projectDurationMs,
  type ArcoProject,
  type BeatRole,
  type CameraMove,
  type Marker,
  type SceneDepth,
  type SceneLayout,
  type ScreenshotScene,
  type TransitionType,
} from "@arco/project-schema";
import { MUSIC_FILE_BY_ID, type MusicTrackId } from "@arco/project-schema/music";
import { STYLE_PRESETS } from "@arco/project-schema/style-presets";

import { evaluateVideoQuality } from "./quality.js";
import type { CompiledVideo, CompileOptions } from "./types.js";

const TRANSITION_OVERLAP_SECONDS = 0.36;

type CompiledScene = {
  id: string;
  start: number;
  duration: number;
  overlap: number;
  transition: TransitionType;
  camera: CameraMove;
  layout: SceneLayout;
  depth: SceneDepth;
};

type CompiledMarker = {
  id: string;
  start: number;
  duration: number;
  scale: number;
  focusX: number;
  focusY: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function compactGeneratedHtml(value: string): string {
  return value
    .replace(/\r?\n\s*/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

function safeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const normalized = value.trim();
  return /^#[0-9a-f]{3,8}$/i.test(normalized) ? normalized : fallback;
}

function seconds(ms: number): number {
  return Number((ms / 1000).toFixed(3));
}

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function resolveAssetUrl(
  src: string,
  options: CompileOptions,
): string {
  if (/^(https?:|blob:|data:|file:)/i.test(src)) return src;
  const base = options.assetBaseUrl ?? "";
  return base ? joinUrl(base, src) : `/${src.replace(/^\/+/, "")}`;
}

function inferBeatRole(
  scene: ScreenshotScene,
  index: number,
  count: number,
): BeatRole {
  if (scene.beatRole) return scene.beatRole;
  if (index === 0) return "hook";
  if (index === count - 1) return "cta";
  if (index === count - 2 && count >= 4) return "proof";
  return index % 2 === 0 ? "benefit" : "feature";
}

function inferLayout(
  scene: ScreenshotScene,
  index: number,
  count: number,
): SceneLayout {
  if (scene.layout) return scene.layout;

  const role = inferBeatRole(scene, index, count);
  if (role === "hook") return "kinetic-hook";
  if (role === "cta") return "cta-lockup";
  if (role === "proof") return "proof-stage";

  const sequence: SceneLayout[] = [
    "split-left",
    "product-focus",
    "split-right",
  ];
  return sequence[index % sequence.length] ?? "product-focus";
}

function inferCamera(scene: ScreenshotScene, index: number): CameraMove {
  if (scene.camera) return scene.camera;

  switch (scene.motion) {
    case "ken-burns-out":
      return "dolly-out";
    case "pan-left":
      return "truck-left";
    case "static":
      return index % 2 === 0 ? "locked" : "orbit";
    case "ken-burns-in":
    default:
      return "dolly-in";
  }
}

function inferDepth(
  scene: ScreenshotScene,
  layout: SceneLayout,
): SceneDepth {
  if (scene.depth) return scene.depth;
  if (layout === "kinetic-hook" || layout === "cta-lockup") {
    return "dimensional";
  }
  return layout.startsWith("split") ? "layered" : "dimensional";
}

function renderLogo(
  project: ArcoProject,
  duration: number,
  options: CompileOptions,
): string {
  const logoSrc = project.brand?.logoSrc;
  if (!logoSrc) return "";

  return `
    <div
      id="brand-mark"
      class="clip brand-mark"
      data-start="0"
      data-duration="${duration}"
      data-track-index="80"
    >
      <img src="${escapeHtml(resolveAssetUrl(logoSrc, options))}" alt="" />
    </div>`;
}

function renderAudio(
  project: ArcoProject,
  duration: number,
  options: CompileOptions,
): string {
  const tracks: string[] = [];
  const hasVoice =
    project.audio?.voiceEnabled !== false &&
    (project.scenes ?? []).some((scene) => Boolean(scene.voAudioSrc));

  if (isScreenshotProject(project) && project.audio?.voiceEnabled !== false) {
    let start = 0;
    for (const scene of project.scenes ?? []) {
      const sceneDuration = seconds(scene.durationMs);
      if (scene.voAudioSrc) {
        tracks.push(`
    <audio
      id="voice-${escapeHtml(scene.id)}"
      data-start="${start}"
      data-duration="${sceneDuration}"
      data-track-index="90"
      data-volume="1"
      src="${escapeHtml(resolveAssetUrl(scene.voAudioSrc, options))}"
    ></audio>`);
      }
      start = Number((start + sceneDuration).toFixed(3));
    }
  }

  const customMusic = project.audio?.customMusicSrc;
  const musicId = project.audio?.musicId as MusicTrackId | undefined;
  const libraryFile = musicId ? MUSIC_FILE_BY_ID[musicId] : undefined;
  const musicSrc = customMusic
    ? resolveAssetUrl(customMusic, options)
    : libraryFile
      ? resolveAssetUrl(libraryFile, options)
      : undefined;

  if (musicSrc) {
    const configuredVolume = project.audio?.volume ?? 0.25;
    const volume =
      hasVoice && project.audio?.duckUnderVoice !== false
        ? Math.min(configuredVolume, 0.16)
        : configuredVolume;

    tracks.push(`
    <audio
      id="music-bed"
      data-start="0"
      data-duration="${duration}"
      data-track-index="91"
      data-volume="${volume.toFixed(3)}"
      src="${escapeHtml(musicSrc)}"
    ></audio>`);
  }

  return tracks.join("");
}

function renderSceneCopy(
  scene: ScreenshotScene,
  role: BeatRole,
  project: ArcoProject,
): string {
  const eyebrow =
    role === "hook"
      ? project.meta.title
      : role === "cta"
        ? "Ready when you are"
        : role;

  return `
        <div class="scene-copy" data-role="copy">
          <div class="eyebrow">${escapeHtml(eyebrow)}</div>
          ${
            scene.headline
              ? `<h1>${escapeHtml(scene.headline)}</h1>`
              : ""
          }
          ${
            scene.subheadline
              ? `<p>${escapeHtml(scene.subheadline)}</p>`
              : ""
          }
          ${
            role === "cta" && project.brief?.productUrl
              ? `<div class="cta-url">${escapeHtml(project.brief.productUrl)}</div>`
              : ""
          }
        </div>`;
}

function renderProductFrame(
  project: ArcoProject,
  scene: ScreenshotScene,
  options: CompileOptions,
): string {
  const portrait = project.meta.height > project.meta.width;

  return `
        <div class="product-stage" data-role="product-stage">
          <div class="product-shadow" data-role="product-shadow"></div>
          <div class="device-shell ${portrait ? "device-mobile" : "device-web"}" data-role="device">
            <div class="device-chrome" aria-hidden="true">
              <span></span><span></span><span></span>
              <div class="address-bar"></div>
            </div>
            <div class="screen">
              <img
                src="${escapeHtml(resolveAssetUrl(scene.imageSrc, options))}"
                alt=""
                data-role="product-image"
              />
            </div>
            <div class="edge-light" aria-hidden="true"></div>
          </div>
        </div>`;
}

function renderScreenshotScenes(
  project: ArcoProject,
  options: CompileOptions,
): {
  html: string;
  scenes: CompiledScene[];
} {
  const scenes = project.scenes ?? [];
  const compiled: CompiledScene[] = [];
  let start = 0;

  const html = scenes
    .map((scene, index) => {
      const duration = seconds(scene.durationMs);
      const overlap =
        index === scenes.length - 1 ? 0 : TRANSITION_OVERLAP_SECONDS;
      const role = inferBeatRole(scene, index, scenes.length);
      const layout = inferLayout(scene, index, scenes.length);
      const camera = inferCamera(scene, index);
      const depth = inferDepth(scene, layout);
      const transition =
        scene.transition?.type ??
        STYLE_PRESETS[project.stylePreset ?? "startup"].motion
          .defaultTransition;
      const id = `scene-${index}-${scene.id.replace(/[^a-z0-9_-]/gi, "-")}`;

      compiled.push({
        id,
        start,
        duration,
        overlap,
        transition,
        camera,
        layout,
        depth,
      });

      const trackDuration = Number((duration + overlap).toFixed(3));
      const markup = `
      <section
        id="${escapeHtml(id)}"
        class="clip scene layout-${layout} depth-${depth}"
        data-start="${start}"
        data-duration="${trackDuration}"
        data-track-index="${index}"
        data-scene-role="${role}"
        style="z-index:${10 + index}"
      >
        <div class="scene-backdrop" data-role="backdrop">
          <div class="ambient ambient-a" data-role="ambient-a"></div>
          <div class="ambient ambient-b" data-role="ambient-b"></div>
          <div class="frame-grid"></div>
        </div>
        ${renderSceneCopy(scene, role, project)}
        ${renderProductFrame(project, scene, options)}
        <div class="scene-number">${String(index + 1).padStart(2, "0")}</div>
      </section>`;

      start = Number((start + duration).toFixed(3));
      return markup;
    })
    .join("");

  return { html, scenes: compiled };
}

function markerPosition(marker: Marker): { x: number; y: number } {
  return {
    x: marker.click?.x ?? marker.focus?.x ?? 0.5,
    y: marker.click?.y ?? marker.focus?.y ?? 0.5,
  };
}

function renderMarkerTrack(
  marker: Marker,
  index: number,
): { html: string; marker: CompiledMarker } {
  const start = seconds(marker.startMs);
  const duration = seconds(marker.durationMs);
  const position = markerPosition(marker);
  const zoom = marker.effects.find((effect) => effect.type === "smooth-zoom");
  const title = marker.effects.some((effect) => effect.type === "title-card");
  const feature = marker.effects.some(
    (effect) => effect.type === "feature-callout",
  );
  const ripple = marker.effects.some(
    (effect) =>
      effect.type === "click-ripple" ||
      effect.type === "pulse" ||
      effect.type === "glow",
  );
  const id = `marker-${index}-${marker.id.replace(/[^a-z0-9_-]/gi, "-")}`;

  const contents: string[] = [];
  if (title && marker.callout?.text) {
    contents.push(`
        <div class="recording-title">
          <div class="eyebrow">${escapeHtml(marker.label ?? "Product story")}</div>
          <h1>${escapeHtml(marker.callout.text)}</h1>
          ${
            marker.callout.subtext
              ? `<p>${escapeHtml(marker.callout.subtext)}</p>`
              : ""
          }
        </div>`);
  }

  if (feature && marker.callout?.text) {
    contents.push(`
        <div
          class="feature-callout"
          style="left:${position.x * 100}%;top:${position.y * 100}%"
        >
          <span class="feature-dot"></span>
          <div class="feature-line"></div>
          <div class="feature-label">
            <strong>${escapeHtml(marker.callout.text)}</strong>
            ${
              marker.callout.subtext
                ? `<span>${escapeHtml(marker.callout.subtext)}</span>`
                : ""
            }
          </div>
        </div>`);
  }

  if (ripple) {
    contents.push(`
        <div
          class="interaction-ripple"
          style="left:${position.x * 100}%;top:${position.y * 100}%"
          data-role="ripple"
        ></div>`);
  }

  return {
    html: `
      <div
        id="${escapeHtml(id)}"
        class="clip marker-track ${title ? "marker-title" : ""}"
        data-start="${start}"
        data-duration="${duration}"
        data-track-index="${30 + index}"
        style="z-index:${40 + index}"
      >
        ${contents.join("")}
      </div>`,
    marker: {
      id,
      start,
      duration,
      scale: zoom?.scale ?? 1,
      focusX: marker.focus?.x ?? 0.5,
      focusY: marker.focus?.y ?? 0.5,
    },
  };
}

function renderRecording(
  project: ArcoProject,
  duration: number,
  options: CompileOptions,
): { html: string; markers: CompiledMarker[] } {
  const markerResults = project.markers.map(renderMarkerTrack);
  const recordingSrc = escapeHtml(
    resolveAssetUrl(project.recording.src, options),
  );

  return {
    html: `
      <div
        id="recording-backdrop"
        class="clip recording-backdrop"
        data-start="0"
        data-duration="${duration}"
        data-track-index="0"
      ></div>
      <video
        id="product-recording"
        class="clip product-recording"
        data-start="0"
        data-duration="${duration}"
        data-track-index="1"
        src="${recordingSrc}"
        muted
        playsinline
      ></video>
      <audio
        id="recording-audio"
        data-start="0"
        data-duration="${duration}"
        data-track-index="2"
        data-volume="1"
        src="${recordingSrc}"
      ></audio>
      ${markerResults.map((result) => result.html).join("")}`,
    markers: markerResults.map((result) => result.marker),
  };
}

function renderStyles(
  project: ArcoProject,
  options: CompileOptions,
): string {
  const preset = STYLE_PRESETS[project.stylePreset ?? "startup"];
  const primary = safeColor(
    project.brand?.primary,
    preset.brand.primary,
  );
  const background = safeColor(
    project.brand?.background,
    preset.brand.background,
  );
  const portrait = project.meta.height > project.meta.width;
  const titleSize = Math.max(68, Math.round(preset.motion.titleSize * 1.35));
  const fontSrc = resolveAssetUrl(
    "fonts/figtree-latin-wght-normal.woff2",
    options,
  );

  return `
    @font-face {
      font-family: "Figtree Arco";
      src: url("${escapeHtml(fontSrc)}") format("woff2");
      font-style: normal;
      font-weight: 300 900;
      font-display: block;
    }

    :root {
      --accent: ${primary};
      --canvas: ${background};
      --ink: #f7f8f8;
      --muted: rgba(247, 248, 248, 0.68);
      --hairline: rgba(255, 255, 255, 0.12);
      --title-size: ${titleSize}px;
      --ease: cubic-bezier(${preset.motion.easing.join(",")});
    }

    * { box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: var(--canvas);
      font-family: "Figtree Arco", "Segoe UI", Arial, sans-serif;
      color: var(--ink);
    }

    #arco-composition {
      position: relative;
      width: ${project.meta.width}px;
      height: ${project.meta.height}px;
      overflow: hidden;
      isolation: isolate;
      background: var(--canvas);
      transform-origin: top left;
    }

    .scene, .marker-track, .recording-backdrop {
      position: absolute;
      inset: 0;
      overflow: hidden;
      opacity: 0;
    }

    .scene-backdrop, .recording-backdrop {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--canvas)) 0%, var(--canvas) 48%),
        var(--canvas);
    }

    .frame-grid {
      position: absolute;
      inset: 0;
      opacity: 0.13;
      background-image:
        linear-gradient(var(--hairline) 1px, transparent 1px),
        linear-gradient(90deg, var(--hairline) 1px, transparent 1px);
      background-size: 96px 96px;
      -webkit-mask-image: linear-gradient(180deg, black, transparent 82%);
      mask-image: linear-gradient(180deg, black, transparent 82%);
    }

    .ambient {
      position: absolute;
      width: 58%;
      aspect-ratio: 1;
      border-radius: 50%;
      opacity: 0.18;
      filter: blur(110px);
      background: var(--accent);
    }

    .ambient-a { right: -18%; top: -34%; }
    .ambient-b { left: -28%; bottom: -50%; opacity: 0.09; }

    .scene-copy {
      position: absolute;
      z-index: 7;
      width: min(42%, 720px);
      left: 7%;
      top: 12%;
    }

    .eyebrow {
      margin-bottom: 22px;
      color: var(--accent);
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    h1 {
      margin: 0;
      max-width: 13ch;
      color: var(--ink);
      font-size: var(--title-size);
      font-weight: 650;
      line-height: 1.02;
      letter-spacing: 0;
      text-wrap: balance;
    }

    .scene-copy p, .recording-title p {
      max-width: 34ch;
      margin: 26px 0 0;
      color: var(--muted);
      font-size: 28px;
      font-weight: 450;
      line-height: 1.35;
      letter-spacing: 0;
      text-wrap: balance;
    }

    .cta-url {
      display: inline-flex;
      margin-top: 34px;
      padding: 14px 20px;
      border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
      border-radius: 6px;
      background: color-mix(in srgb, var(--canvas) 78%, transparent);
      color: var(--ink);
      font-size: 20px;
      font-weight: 650;
      letter-spacing: 0;
    }

    .product-stage {
      position: absolute;
      z-index: 5;
      left: 28%;
      top: 18%;
      width: 66%;
      height: 68%;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1800px;
      transform-style: preserve-3d;
    }

    .product-shadow {
      position: absolute;
      width: 72%;
      height: 22%;
      left: 15%;
      bottom: -8%;
      border-radius: 50%;
      background: color-mix(in srgb, var(--accent) 22%, #000);
      filter: blur(70px);
      opacity: 0.6;
      transform: rotateX(74deg);
    }

    .device-shell {
      position: relative;
      width: 90%;
      max-width: 1280px;
      aspect-ratio: 16 / 10;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--accent) 34%, rgba(255,255,255,0.2));
      border-radius: 18px;
      background: #0d0f12;
      box-shadow:
        0 70px 150px rgba(0, 0, 0, 0.55),
        0 1px 0 rgba(255,255,255,0.18) inset;
      transform-style: preserve-3d;
      will-change: transform;
    }

    .device-mobile {
      width: 46%;
      max-width: 470px;
      aspect-ratio: 9 / 19.5;
      border-radius: 34px;
    }

    .device-chrome {
      position: relative;
      height: 44px;
      flex: 0 0 44px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      background: #17191d;
    }

    .device-mobile .device-chrome {
      height: 34px;
      flex-basis: 34px;
      justify-content: center;
    }

    .device-chrome > span {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: rgba(255,255,255,0.22);
    }

    .device-mobile .device-chrome > span { display: none; }

    .address-bar {
      height: 20px;
      flex: 1;
      margin-left: 8px;
      border-radius: 5px;
      background: rgba(255,255,255,0.06);
    }

    .device-mobile .address-bar {
      flex: 0 0 76px;
      height: 8px;
      margin: 0;
      border-radius: 8px;
    }

    .screen {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      background: #0b0c0f;
    }

    .screen img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      will-change: transform;
    }

    .edge-light {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.08) inset,
        0 -1px 0 color-mix(in srgb, var(--accent) 30%, transparent) inset;
    }

    .scene-number {
      position: absolute;
      right: 46px;
      bottom: 36px;
      z-index: 8;
      color: rgba(255,255,255,0.38);
      font: 600 16px/1 ui-monospace, "SFMono-Regular", Consolas, monospace;
      letter-spacing: 0;
    }

    .layout-product-focus .scene-copy {
      top: auto;
      bottom: 8%;
      width: 58%;
    }

    .layout-product-focus .product-stage {
      left: 10%;
      top: 8%;
      width: 82%;
      height: 70%;
    }

    .layout-product-focus .scene-copy p {
      max-width: 48ch;
      font-size: 24px;
    }

    .layout-split-left .scene-copy {
      left: 6%;
      top: 25%;
      width: 34%;
    }

    .layout-split-left .product-stage {
      left: 39%;
      top: 13%;
      width: 58%;
      height: 74%;
    }

    .layout-split-right .scene-copy {
      left: 60%;
      top: 25%;
      width: 34%;
    }

    .layout-split-right .product-stage {
      left: 3%;
      top: 13%;
      width: 58%;
      height: 74%;
    }

    .layout-proof-stage .scene-copy {
      left: 7%;
      top: 8%;
      width: 70%;
    }

    .layout-proof-stage .scene-copy h1 { max-width: 18ch; }
    .layout-proof-stage .product-stage {
      left: 12%;
      top: 25%;
      width: 78%;
      height: 68%;
    }

    .layout-kinetic-hook .scene-copy {
      left: 7%;
      top: 12%;
      width: 48%;
    }

    .layout-kinetic-hook .scene-copy h1 {
      max-width: 11ch;
      font-size: calc(var(--title-size) * 1.15);
    }

    .layout-kinetic-hook .product-stage {
      left: 38%;
      top: 30%;
      width: 60%;
      height: 65%;
      transform: rotate(-1deg);
    }

    .layout-cta-lockup .scene-copy {
      left: 12%;
      top: 22%;
      width: 76%;
      text-align: center;
    }

    .layout-cta-lockup .scene-copy h1,
    .layout-cta-lockup .scene-copy p {
      margin-left: auto;
      margin-right: auto;
    }

    .layout-cta-lockup .product-stage {
      left: 20%;
      top: 46%;
      width: 60%;
      height: 52%;
      opacity: 0.42;
    }

    .depth-flat .device-shell { box-shadow: 0 32px 80px rgba(0,0,0,0.42); }
    .depth-layered .product-stage { perspective: 2200px; }

    .brand-mark {
      position: absolute;
      z-index: 90;
      left: 42px;
      top: 36px;
      width: 150px;
      height: 54px;
      display: flex;
      align-items: center;
      opacity: 0;
      pointer-events: none;
    }

    .brand-mark img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .recording-backdrop {
      opacity: 1;
      background:
        linear-gradient(145deg, color-mix(in srgb, var(--accent) 11%, var(--canvas)), var(--canvas) 58%);
    }

    .product-recording {
      position: absolute;
      z-index: 5;
      inset: 5%;
      width: 90%;
      height: 90%;
      object-fit: contain;
      border: 1px solid var(--hairline);
      border-radius: 14px;
      background: #08090b;
      box-shadow: 0 60px 140px rgba(0,0,0,0.52);
      transform-origin: center;
      will-change: transform, filter, opacity;
    }

    .marker-track {
      pointer-events: none;
    }

    .marker-title {
      display: flex;
      align-items: flex-end;
      padding: 8%;
      background: linear-gradient(180deg, transparent 20%, color-mix(in srgb, var(--canvas) 94%, transparent));
    }

    .recording-title {
      max-width: 72%;
    }

    .recording-title h1 { max-width: 14ch; }

    .feature-callout {
      position: absolute;
      width: 1px;
      height: 1px;
    }

    .feature-dot {
      position: absolute;
      left: -8px;
      top: -8px;
      width: 16px;
      height: 16px;
      border: 3px solid var(--ink);
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 72%, transparent);
    }

    .feature-line {
      position: absolute;
      left: 12px;
      bottom: 6px;
      width: 130px;
      height: 1px;
      background: var(--accent);
      transform: rotate(-24deg);
      transform-origin: left center;
    }

    .feature-label {
      position: absolute;
      left: 124px;
      bottom: 58px;
      width: 310px;
      padding: 18px 20px;
      border: 1px solid color-mix(in srgb, var(--accent) 48%, transparent);
      border-radius: 8px;
      background: color-mix(in srgb, var(--canvas) 88%, transparent);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }

    .feature-label strong,
    .feature-label span {
      display: block;
      letter-spacing: 0;
    }

    .feature-label strong { font-size: 22px; line-height: 1.15; }
    .feature-label span {
      margin-top: 7px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.35;
    }

    .interaction-ripple {
      position: absolute;
      width: 44px;
      height: 44px;
      border: 3px solid var(--accent);
      border-radius: 50%;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.4);
      box-shadow: 0 0 44px color-mix(in srgb, var(--accent) 55%, transparent);
    }

    ${
      portrait
        ? `
    .scene-copy {
      left: 8%;
      top: 9%;
      width: 84%;
      text-align: left;
    }
    h1 {
      max-width: 12ch;
      font-size: 74px;
    }
    .scene-copy p { max-width: 28ch; font-size: 30px; }
    .product-stage,
    .layout-split-left .product-stage,
    .layout-split-right .product-stage,
    .layout-product-focus .product-stage,
    .layout-proof-stage .product-stage,
    .layout-kinetic-hook .product-stage {
      left: 6%;
      top: 38%;
      width: 88%;
      height: 55%;
    }
    .layout-split-right .scene-copy,
    .layout-split-left .scene-copy,
    .layout-product-focus .scene-copy,
    .layout-proof-stage .scene-copy,
    .layout-kinetic-hook .scene-copy {
      left: 8%;
      top: 9%;
      width: 84%;
    }
    .layout-cta-lockup .scene-copy {
      left: 8%;
      top: 19%;
      width: 84%;
      text-align: center;
    }
    .layout-cta-lockup .product-stage {
      left: 8%;
      top: 54%;
      width: 84%;
      height: 42%;
    }
    .brand-mark { left: 30px; top: 28px; }
    .scene-number { right: 30px; bottom: 28px; }
    .product-recording { inset: 3%; width: 94%; height: 94%; }
    `
        : ""
    }
  `;
}

function renderRuntime(
  duration: number,
  scenes: CompiledScene[],
  markers: CompiledMarker[],
): string {
  const config = {
    duration,
    scenes,
    markers,
  };

  return `
    (() => {
      "use strict";
      const config = ${safeScriptJson(config)};
      const clamp = (value, min = 0, max = 1) =>
        Math.min(max, Math.max(min, value));
      const smooth = (value) => {
        const t = clamp(value);
        return t * t * (3 - 2 * t);
      };
      const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
      const byId = (id) => document.getElementById(id);

      function cameraTransform(camera, progress) {
        const p = easeOut(progress);
        switch (camera) {
          case "dolly-out":
            return { scale: 1.075 - p * 0.065, x: 0, y: 0, rx: 0, ry: 0 };
          case "truck-left":
            return { scale: 1.045, x: 2.2 - p * 4.4, y: 0, rx: 0, ry: 0 };
          case "truck-right":
            return { scale: 1.045, x: -2.2 + p * 4.4, y: 0, rx: 0, ry: 0 };
          case "orbit":
            return {
              scale: 1.025,
              x: 0,
              y: 0,
              rx: 1.4 - p * 2.8,
              ry: -2.6 + p * 5.2,
            };
          case "locked":
            return { scale: 1, x: 0, y: 0, rx: 0, ry: 0 };
          case "dolly-in":
          default:
            return { scale: 1 + p * 0.07, x: 0, y: -p * 0.7, rx: 0, ry: 0 };
        }
      }

      function transitionTransform(type, enter, exit) {
        const incoming = 1 - enter;
        switch (type) {
          case "push":
            return {
              opacity: 1 - exit,
              transform: "translate3d(" + (incoming * 8 - exit * 6) + "%,0,0)",
              filter: "none",
            };
          case "slide":
            return {
              opacity: enter * (1 - exit),
              transform: "translate3d(0," + (incoming * 6 - exit * 4) + "%,0)",
              filter: "none",
            };
          case "scale":
            return {
              opacity: enter * (1 - exit),
              transform: "scale(" + (0.94 + enter * 0.06 + exit * 0.03) + ")",
              filter: "none",
            };
          case "blur":
            return {
              opacity: enter * (1 - exit),
              transform: "scale(1)",
              filter: "blur(" + (incoming * 16 + exit * 10) + "px)",
            };
          case "morph":
            return {
              opacity: enter * (1 - exit),
              transform: "scale(" + (0.97 + enter * 0.03 - exit * 0.02) + ")",
              filter: "blur(" + incoming * 7 + "px)",
            };
          case "fade":
          default:
            return {
              opacity: enter * (1 - exit),
              transform: "scale(1)",
              filter: "none",
            };
        }
      }

      function renderScene(scene, time) {
        const element = byId(scene.id);
        if (!element) return;
        const end = scene.start + scene.duration + scene.overlap;
        const active = time >= scene.start && time <= end;
        if (!active) {
          element.style.opacity = "0";
          return;
        }

        const local = time - scene.start;
        const progress = clamp(local / scene.duration);
        const enterWindow = Math.min(0.42, scene.duration * 0.14);
        const enter = smooth(local / Math.max(0.001, enterWindow));
        const exit = scene.overlap > 0
          ? smooth((local - scene.duration) / scene.overlap)
          : smooth((local - Math.max(0, scene.duration - 0.22)) / 0.22);
        const transition = transitionTransform(scene.transition, enter, exit);
        element.style.opacity = String(transition.opacity);
        element.style.transform = transition.transform;
        element.style.filter = transition.filter;

        const copy = element.querySelector('[data-role="copy"]');
        if (copy) {
          const copyIn = easeOut((local - 0.08) / Math.min(0.7, scene.duration * 0.22));
          const copyOut = smooth((local - Math.max(0, scene.duration - 0.35)) / 0.35);
          copy.style.opacity = String(copyIn * (1 - copyOut));
          copy.style.transform = "translate3d(0," + ((1 - copyIn) * 38 - copyOut * 18) + "px,0)";
        }

        const device = element.querySelector('[data-role="device"]');
        const image = element.querySelector('[data-role="product-image"]');
        const shadow = element.querySelector('[data-role="product-shadow"]');
        const camera = cameraTransform(scene.camera, progress);
        if (device) {
          device.style.transform =
            "translate3d(" + camera.x + "%," + camera.y + "%,0) " +
            "rotateX(" + camera.rx + "deg) rotateY(" + camera.ry + "deg) " +
            "scale(" + camera.scale + ")";
        }
        if (image) {
          image.style.transform = "scale(" + (1 + progress * 0.018) + ")";
        }
        if (shadow) {
          shadow.style.opacity = String(0.45 + Math.sin(progress * Math.PI) * 0.2);
          shadow.style.transform =
            "rotateX(74deg) scale(" + (0.92 + progress * 0.12) + ")";
        }

        const ambientA = element.querySelector('[data-role="ambient-a"]');
        const ambientB = element.querySelector('[data-role="ambient-b"]');
        if (ambientA) {
          ambientA.style.transform =
            "translate3d(" + (progress * -6) + "%," + (progress * 4) + "%,0)";
        }
        if (ambientB) {
          ambientB.style.transform =
            "translate3d(" + (progress * 5) + "%," + (progress * -3) + "%,0)";
        }
      }

      function renderRecording(time) {
        const recording = byId("product-recording");
        if (!recording) return;

        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let originX = 50;
        let originY = 50;

        for (const marker of config.markers) {
          const progress = clamp((time - marker.start) / marker.duration);
          const active = time >= marker.start && time <= marker.start + marker.duration;
          if (!active || marker.scale <= 1.001) continue;
          const envelope = Math.sin(progress * Math.PI);
          const markerScale = 1 + (marker.scale - 1) * envelope;
          if (markerScale > scale) {
            scale = markerScale;
            originX = marker.focusX * 100;
            originY = marker.focusY * 100;
            translateX = (0.5 - marker.focusX) * (scale - 1) * 42;
            translateY = (0.5 - marker.focusY) * (scale - 1) * 42;
          }
        }

        recording.style.transformOrigin = originX + "% " + originY + "%";
        recording.style.transform =
          "translate3d(" + translateX + "%," + translateY + "%,0) scale(" + scale + ")";
      }

      function renderMarker(marker, time) {
        const element = byId(marker.id);
        if (!element) return;
        const local = time - marker.start;
        const active = local >= 0 && local <= marker.duration;
        if (!active) {
          element.style.opacity = "0";
          return;
        }

        const progress = clamp(local / marker.duration);
        const enter = easeOut(progress / 0.15);
        const exit = smooth((progress - 0.84) / 0.16);
        element.style.opacity = String(enter * (1 - exit));

        const ripple = element.querySelector('[data-role="ripple"]');
        if (ripple) {
          const rippleProgress = clamp(progress / 0.62);
          ripple.style.opacity = String(Math.sin(rippleProgress * Math.PI) * 0.92);
          ripple.style.transform =
            "translate(-50%,-50%) scale(" + (0.4 + rippleProgress * 4.1) + ")";
        }

        const title = element.querySelector(".recording-title");
        if (title) {
          title.style.transform = "translate3d(0," + ((1 - enter) * 38) + "px,0)";
        }

        const callout = element.querySelector(".feature-callout");
        if (callout) {
          callout.style.transform = "scale(" + (0.92 + enter * 0.08) + ")";
        }
      }

      function renderAt(time) {
        const safeTime = clamp(Number(time) || 0, 0, config.duration);
        for (const scene of config.scenes) renderScene(scene, safeTime);
        renderRecording(safeTime);
        for (const marker of config.markers) renderMarker(marker, safeTime);

        const logo = byId("brand-mark");
        if (logo) {
          const enter = easeOut(safeTime / 0.45);
          const exit = smooth((safeTime - Math.max(0, config.duration - 0.35)) / 0.35);
          logo.style.opacity = String(enter * (1 - exit));
          logo.style.transform = "translate3d(0," + ((1 - enter) * -12) + "px,0)";
        }
      }

      window.addEventListener("hf-seek", (event) => {
        const detail = event.detail || {};
        renderAt(detail.time ?? detail.currentTime ?? 0);
      });
      window.__arcoRenderAt = renderAt;
      renderAt(0);
    })();
  `;
}

declare global {
  interface Window {
    __arcoRenderAt?: (time: number) => void;
  }
}

export function compileArcoVideo(
  input: ArcoProject,
  options: CompileOptions = {},
): CompiledVideo {
  const project = parseArcoProject(input);
  const durationSeconds = seconds(projectDurationMs(project));
  const quality = evaluateVideoQuality(project);
  const screenshotMode = isScreenshotProject(project);
  const screenshot = screenshotMode
    ? renderScreenshotScenes(project, options)
    : { html: "", scenes: [] as CompiledScene[] };
  const recording = screenshotMode
    ? { html: "", markers: [] as CompiledMarker[] }
    : renderRecording(project, durationSeconds, options);

  const html = compactGeneratedHtml(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(project.meta.title)}</title>
    <style>${renderStyles(project, options)}</style>
  </head>
  <body>
    <main
      id="arco-composition"
      class="${project.meta.height > project.meta.width ? "portrait" : "landscape"}"
      data-composition-id="arco-main"
      data-start="0"
      data-duration="${durationSeconds}"
      data-width="${project.meta.width}"
      data-height="${project.meta.height}"
      data-fps="${project.meta.fps}"
      data-bg="${safeColor(project.brand?.background, "#07080a")}"
      data-no-timeline
    >
      ${screenshot.html}
      ${recording.html}
      ${renderLogo(project, durationSeconds, options)}
      ${renderAudio(project, durationSeconds, options)}
    </main>
    <script>${renderRuntime(
      durationSeconds,
      screenshot.scenes,
      recording.markers,
    )}</script>
  </body>
</html>`);

  return {
    html,
    durationSeconds,
    quality,
  };
}
