import type {
  ArcoProject,
  ScreenshotMotion,
  ScreenshotScene,
  StylePreset,
  TransitionType,
} from "@arco/project-schema";
import { msToFrames } from "@arco/project-schema";
import { STYLE_PRESETS } from "@arco/project-schema/style-presets";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { DeviceFrame } from "./DeviceFrame";

type ScreenshotStoryboardProps = {
  project: ArcoProject;
};

function sceneStartFrame(
  scenes: ScreenshotScene[],
  index: number,
  fps: number,
): number {
  let ms = 0;
  for (let i = 0; i < index; i++) {
    ms += scenes[i]?.durationMs ?? 0;
  }
  return msToFrames(ms, fps);
}

function bezierForPreset(preset: StylePreset) {
  const [a, b, c, d] = STYLE_PRESETS[preset].motion.easing;
  return Easing.bezier(a, b, c, d);
}

function motionTransform(
  motion: ScreenshotMotion | undefined,
  progress: number,
  amplitude: number,
  easing: (t: number) => number,
) {
  const p = easing(Math.min(1, Math.max(0, progress)));
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  switch (motion) {
    case "ken-burns-out":
      scale = interpolate(p, [0, 1], [1 + amplitude * 1.2, 1 + amplitude * 0.2]);
      break;
    case "pan-left":
      translateX = interpolate(p, [0, 1], [amplitude * 40, -amplitude * 40]);
      scale = 1 + amplitude;
      break;
    case "static":
      scale = 1 + amplitude * 0.4;
      break;
    case "ken-burns-in":
    default:
      scale = interpolate(p, [0, 1], [1 + amplitude * 0.2, 1 + amplitude * 1.2]);
      break;
  }

  return { scale, translateX, translateY };
}

function transitionStyles(
  type: TransitionType,
  progress: number,
  easing: (t: number) => number,
): {
  opacity: number;
  blur: number;
  translateX: number;
  translateY: number;
  scale: number;
} {
  const enter = Math.min(1, progress / 0.12);
  const exit = Math.min(1, Math.max(0, (progress - 0.88) / 0.12));
  const enterE = easing(enter);
  const exitE = easing(exit);

  switch (type) {
    case "push":
      return {
        opacity: 1,
        blur: 0,
        translateX: interpolate(enterE, [0, 1], [8, 0]) + interpolate(exitE, [0, 1], [0, -8]),
        translateY: 0,
        scale: 1,
      };
    case "slide":
      return {
        opacity: interpolate(enterE, [0, 1], [0, 1]) * interpolate(exitE, [0, 1], [1, 0]),
        blur: 0,
        translateX: 0,
        translateY: interpolate(enterE, [0, 1], [6, 0]) + interpolate(exitE, [0, 1], [0, -4]),
        scale: 1,
      };
    case "scale":
      return {
        opacity: interpolate(enterE, [0, 1], [0, 1]) * interpolate(exitE, [0, 1], [1, 0]),
        blur: 0,
        translateX: 0,
        translateY: 0,
        scale: interpolate(enterE, [0, 1], [0.92, 1]) * interpolate(exitE, [0, 1], [1, 1.04]),
      };
    case "blur":
      return {
        opacity: interpolate(enterE, [0, 1], [0, 1]) * interpolate(exitE, [0, 1], [1, 0]),
        blur: interpolate(enterE, [0, 1], [12, 0]) + interpolate(exitE, [0, 1], [0, 10]),
        translateX: 0,
        translateY: 0,
        scale: 1,
      };
    case "morph":
      return {
        opacity: interpolate(enterE, [0, 1], [0, 1]) * interpolate(exitE, [0, 1], [1, 0]),
        blur: interpolate(enterE, [0, 1], [6, 0]),
        translateX: 0,
        translateY: 0,
        scale: interpolate(enterE, [0, 1], [0.96, 1]) * interpolate(exitE, [0, 1], [1, 0.98]),
      };
    case "fade":
    default:
      return {
        opacity: interpolate(enterE, [0, 1], [0, 1]) * interpolate(exitE, [0, 1], [1, 0]),
        blur: 0,
        translateX: 0,
        translateY: 0,
        scale: 1,
      };
  }
}

function SceneImage({
  scene,
  fps,
  background,
  primary,
  platform,
  amplitude,
  easing,
}: {
  scene: ScreenshotScene;
  fps: number;
  background: string;
  primary: string;
  platform: "web" | "mobile" | "both";
  amplitude: number;
  easing: (t: number) => number;
}) {
  const frame = useCurrentFrame();
  const durationFrames = msToFrames(scene.durationMs, fps);
  const progress = durationFrames > 0 ? frame / durationFrames : 0;
  const motion = motionTransform(scene.motion, progress, amplitude, easing);
  const transition = transitionStyles(
    scene.transition?.type ?? "fade",
    progress,
    easing,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        backgroundImage: `radial-gradient(ellipse at 50% 30%, ${primary}33 0%, ${background} 65%)`,
        opacity: transition.opacity,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        filter: transition.blur > 0.1 ? `blur(${transition.blur}px)` : undefined,
        transform: `translate(${transition.translateX}%, ${transition.translateY}%) scale(${transition.scale})`,
      }}
    >
      <DeviceFrame platform={platform === "both" ? "web" : platform} accent={primary}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${motion.scale}) translate(${motion.translateX}%, ${motion.translateY}%)`,
            transformOrigin: "center center",
          }}
        >
          <Img
            src={scene.imageSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </DeviceFrame>
    </AbsoluteFill>
  );
}

function SceneTitle({
  scene,
  fps,
  primary,
  background,
  titleSize,
  layout,
  isCard,
  easing,
}: {
  scene: ScreenshotScene;
  fps: number;
  primary: string;
  background: string;
  titleSize: number;
  layout: "bottom" | "card";
  isCard: boolean;
  easing: (t: number) => number;
}) {
  const frame = useCurrentFrame();
  const durationFrames = msToFrames(scene.durationMs, fps);
  const progress = durationFrames > 0 ? frame / durationFrames : 0;
  const enter = easing(Math.min(1, progress / 0.15));
  const opacity = interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
  const translateY = interpolate(enter, [0, 1], [28, 0]);

  if (!scene.headline) return null;

  if (isCard || layout === "card") {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: `${background}99`,
          alignItems: "center",
          justifyContent: "center",
          opacity,
          pointerEvents: "none",
          padding: 64,
        }}
      >
        <div
          style={{
            transform: `translateY(${translateY}px)`,
            textAlign: "center",
            maxWidth: "70%",
          }}
        >
          <div
            style={{
              fontFamily:
                "Georgia, 'Times New Roman', ui-serif, serif",
              fontSize: titleSize,
              fontWeight: 600,
              color: "#f9f9f9",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {scene.headline}
          </div>
          {scene.subheadline ? (
            <div
              style={{
                marginTop: 16,
                fontFamily:
                  "ui-sans-serif, system-ui, -apple-system, sans-serif",
                fontSize: Math.round(titleSize * 0.38),
                fontWeight: 500,
                color: primary,
              }}
            >
              {scene.subheadline}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${background}00 0%, ${background}cc 55%, ${background}ee 100%)`,
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: 80,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div style={{ transform: `translateY(${translateY}px)`, maxWidth: "85%" }}>
        <div
          style={{
            width: 48,
            height: 4,
            backgroundColor: primary,
            marginBottom: 16,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: titleSize,
            fontWeight: 650,
            color: "#f9f9f9",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {scene.headline}
        </div>
        {scene.subheadline ? (
          <div
            style={{
              marginTop: 12,
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: Math.round(titleSize * 0.4),
              fontWeight: 500,
              color: primary,
              letterSpacing: "0.01em",
            }}
          >
            {scene.subheadline}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}

export function ScreenshotStoryboard({ project }: ScreenshotStoryboardProps) {
  const scenes = project.scenes ?? [];
  const fps = project.meta.fps;
  const primary = project.brand?.primary ?? "#55b3ff";
  const background = project.brand?.background ?? "#07080a";
  const preset = (project.stylePreset ?? "startup") as StylePreset;
  const presetMotion = STYLE_PRESETS[preset].motion;
  const titleSize = presetMotion.titleSize;
  const amplitude = presetMotion.kenBurnsAmplitude;
  const easing = bezierForPreset(preset);
  const framePlatform: "web" | "mobile" | "both" =
    project.exportFormat === "9:16" ? "mobile" : "web";

  if (scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontFamily: "sans-serif",
        }}
      >
        No screenshots
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {scenes.map((scene, index) => {
        const from = sceneStartFrame(scenes, index, fps);
        const durationInFrames = msToFrames(scene.durationMs, fps);
        const isCard =
          index === 0 || index === scenes.length - 1
            ? presetMotion.titleLayout === "card" || preset === "apple"
            : false;

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={durationInFrames}
          >
            <SceneImage
              scene={scene}
              fps={fps}
              background={background}
              primary={primary}
              platform={framePlatform}
              amplitude={amplitude}
              easing={easing}
            />
            <SceneTitle
              scene={scene}
              fps={fps}
              primary={primary}
              background={background}
              titleSize={titleSize}
              layout={presetMotion.titleLayout}
              isCard={isCard}
              easing={easing}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
