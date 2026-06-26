import type { Marker } from "@arco/project-schema";
import { AbsoluteFill, interpolate } from "remotion";
import { isMarkerActive, markerProgress } from "../lib/motion";

type FeatureCalloutProps = {
  frame: number;
  fps: number;
  marker: Marker;
  primary: string;
};

export function FeatureCallout({
  frame,
  fps,
  marker,
  primary,
}: FeatureCalloutProps) {
  const hasCallout = marker.effects.some((e) => e.type === "feature-callout");
  if (!hasCallout || !marker.callout?.text || !isMarkerActive(frame, fps, marker)) {
    return null;
  }

  const progress = markerProgress(frame, fps, marker);
  const opacity = interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
  const click = marker.click ?? { x: 0.5, y: 0.5 };
  const pointerX = click.x * 100;
  const pointerY = click.y * 100;
  const labelX = Math.min(72, Math.max(28, pointerX));
  const labelY = Math.max(18, pointerY - 14);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={labelX}
          y1={labelY + 6}
          x2={pointerX}
          y2={pointerY}
          stroke={primary}
          strokeWidth="0.35"
          strokeOpacity={0.9}
        />
        <circle cx={pointerX} cy={pointerY} r="1.2" fill={primary} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: `${labelX}%`,
          top: `${labelY}%`,
          transform: "translate(-50%, -100%)",
          maxWidth: "32%",
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(7, 8, 10, 0.88)",
          border: `1px solid ${primary}66`,
          boxShadow: `0 8px 32px ${primary}22`,
        }}
      >
        <div
          style={{
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: "#f9f9f9",
            lineHeight: 1.2,
          }}
        >
          {marker.callout.text}
        </div>
        {marker.callout.subtext ? (
          <div
            style={{
              marginTop: 6,
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
              fontSize: 14,
              color: "#a1a1aa",
            }}
          >
            {marker.callout.subtext}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
