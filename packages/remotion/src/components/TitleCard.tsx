import type { Marker } from "@arco/project-schema";
import { AbsoluteFill, interpolate } from "remotion";
import { isMarkerActive, markerProgress } from "../lib/motion";

type TitleCardProps = {
  frame: number;
  fps: number;
  marker: Marker;
  primary: string;
  background: string;
  titleSize?: number;
};

export function TitleCard({
  frame,
  fps,
  marker,
  primary,
  background,
  titleSize = 56,
}: TitleCardProps) {
  const isTitle = marker.effects.some((e) => e.type === "title-card");
  if (!isTitle || !marker.callout || !isMarkerActive(frame, fps, marker)) {
    return null;
  }

  const progress = markerProgress(frame, fps, marker);
  const opacity = interpolate(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const translateY = interpolate(progress, [0, 0.2], [24, 0], {
    extrapolateRight: "clamp",
  });

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
              'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: titleSize,
            fontWeight: 600,
            color: "#f9f9f9",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {marker.callout.text}
        </div>
        {marker.callout.subtext ? (
          <div
            style={{
              marginTop: 12,
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
              fontSize: 22,
              fontWeight: 500,
              color: primary,
              letterSpacing: "0.02em",
            }}
          >
            {marker.callout.subtext}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
