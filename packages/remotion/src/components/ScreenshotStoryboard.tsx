import type { ArcoProject, ScreenshotScene } from "@arco/project-schema";
import { msToFrames } from "@arco/project-schema";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

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

function SceneImage({
  scene,
  fps,
  background,
}: {
  scene: ScreenshotScene;
  fps: number;
  background: string;
}) {
  const frame = useCurrentFrame();
  const durationFrames = msToFrames(scene.durationMs, fps);
  const progress = durationFrames > 0 ? frame / durationFrames : 0;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  switch (scene.motion) {
    case "ken-burns-in":
      scale = interpolate(progress, [0, 1], [1.05, 1.18], {
        extrapolateRight: "clamp",
      });
      break;
    case "ken-burns-out":
      scale = interpolate(progress, [0, 1], [1.18, 1.05], {
        extrapolateRight: "clamp",
      });
      break;
    case "pan-left":
      translateX = interpolate(progress, [0, 1], [2, -2], {
        extrapolateRight: "clamp",
      });
      scale = 1.1;
      break;
    default:
      scale = 1.08;
      break;
  }

  const transitionType = scene.transition?.type ?? "fade";
  let opacity = 1;
  if (transitionType === "fade") {
    opacity = interpolate(
      progress,
      [0, 0.08, 0.92, 1],
      [0, 1, 1, 0],
      { extrapolateRight: "clamp" },
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        opacity,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={scene.imageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function SceneTitle({
  scene,
  fps,
  primary,
  background,
  titleSize,
}: {
  scene: ScreenshotScene;
  fps: number;
  primary: string;
  background: string;
  titleSize: number;
}) {
  const frame = useCurrentFrame();
  const durationFrames = msToFrames(scene.durationMs, fps);
  const progress = durationFrames > 0 ? frame / durationFrames : 0;
  const opacity = interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
  const translateY = interpolate(progress, [0, 0.15], [24, 0], {
    extrapolateRight: "clamp",
  });

  if (!scene.headline) return null;

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
      <div style={{ transform: `translateY(${translateY}px)` }}>
        <div
          style={{
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontSize: titleSize,
            fontWeight: 600,
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
                "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: 22,
              fontWeight: 500,
              color: primary,
              letterSpacing: "0.02em",
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
  const titleSize = 56;

  if (scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontFamily: "Inter, sans-serif",
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

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={durationInFrames}
          >
            <SceneImage scene={scene} fps={fps} background={background} />
            <SceneTitle
              scene={scene}
              fps={fps}
              primary={primary}
              background={background}
              titleSize={titleSize}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
