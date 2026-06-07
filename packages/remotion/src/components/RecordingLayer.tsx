import type { ArcoProject } from "@arco/project-schema";
import { AbsoluteFill, Video } from "remotion";
import { getActiveCameraTransform, getTransitionBlur, getTransitionOpacity, getTransitionScale, getTransitionSlide } from "../lib/motion";

type RecordingLayerProps = {
  project: ArcoProject;
  frame: number;
};

export function RecordingLayer({ project, frame }: RecordingLayerProps) {
  const { meta, recording, markers, brand } = project;
  const camera = getActiveCameraTransform(frame, meta.fps, markers);
  const opacity = getTransitionOpacity(frame, meta.fps, markers);
  const blur = getTransitionBlur(frame, meta.fps, markers);
  const slideY = getTransitionSlide(frame, meta.fps, markers);
  const transitionScale = getTransitionScale(frame, meta.fps, markers);
  const bg = brand?.background ?? "#07080a";
  const primary = brand?.primary ?? "#55b3ff";

  const usePlaceholder = recording.src === "placeholder";

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: `translateY(${slideY}%) scale(${transitionScale * camera.scale}) translate(${camera.translateX}%, ${camera.translateY}%)`,
          transformOrigin: `${camera.originX} ${camera.originY}`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        {usePlaceholder ? (
          <PlaceholderUI primary={primary} title={project.meta.title} />
        ) : (
          <Video
            src={recording.src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function PlaceholderUI({
  primary,
  title,
}: {
  primary: string;
  title: string;
}) {
  return (
    <AbsoluteFill
      style={{
        padding: 64,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          height: 48,
          width: 180,
          borderRadius: 8,
          background: `linear-gradient(90deg, ${primary}44, ${primary}22)`,
        }}
      />
      <div
        style={{
          flex: 1,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          padding: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 120,
              borderRadius: 12,
              background: `rgba(85, 179, 255, ${0.06 + i * 0.02})`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: "#6a6b6c",
          textAlign: "center",
        }}
      >
        Placeholder UI — drop a recording path in golden-project.json
        <br />
        {title}
      </div>
    </AbsoluteFill>
  );
}
