import type { Marker } from "@arco/project-schema";
import { AbsoluteFill, interpolate } from "remotion";
import { isMarkerActive, markerProgress } from "../lib/motion";

type ClickEffectsProps = {
  frame: number;
  fps: number;
  marker: Marker;
  primary: string;
  background: string;
};

function getPosition(marker: Marker) {
  const x = marker.click?.x ?? marker.focus?.x ?? 0.5;
  const y = marker.click?.y ?? marker.focus?.y ?? 0.5;
  return { left: `${x * 100}%`, top: `${y * 100}%` };
}

export function ClickEffects({
  frame,
  fps,
  marker,
  primary,
  background,
}: ClickEffectsProps) {
  if (!isMarkerActive(frame, fps, marker)) return null;

  const progress = markerProgress(frame, fps, marker);
  const pos = getPosition(marker);
  const effects = marker.effects;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {effects.some((e) => e.type === "click-ripple") && (
        <RippleRing progress={progress} primary={primary} pos={pos} intensity={0.85} />
      )}
      {effects.some((e) => e.type === "pulse") && (
        <RippleRing progress={progress} primary={primary} pos={pos} intensity={0.95} pulse />
      )}
      {effects.some((e) => e.type === "glow") && (
        <GlowDot progress={progress} primary={primary} pos={pos} />
      )}
      {effects.some((e) => e.type === "spotlight") && (
        <SpotlightOverlay progress={progress} primary={primary} background={background} marker={marker} />
      )}
    </AbsoluteFill>
  );
}

function RippleRing({
  progress,
  primary,
  pos,
  intensity,
  pulse = false,
}: {
  progress: number;
  primary: string;
  pos: { left: string; top: string };
  intensity: number;
  pulse?: boolean;
}) {
  const size = interpolate(progress, [0, 1], pulse ? [20, 180] : [40, 220]);
  const opacity = interpolate(progress, [0, 0.2, 1], [0, intensity, 0]);
  const borderWidth = pulse ? 4 : 3;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${borderWidth}px solid ${primary}`,
        opacity,
        boxShadow: pulse
          ? `0 0 60px ${primary}88, inset 0 0 30px ${primary}44`
          : `0 0 40px ${primary}55`,
      }}
    />
  );
}

function GlowDot({
  progress,
  primary,
  pos,
}: {
  progress: number;
  primary: string;
  pos: { left: string; top: string };
}) {
  const size = interpolate(progress, [0, 0.5, 1], [16, 48, 24]);
  const opacity = interpolate(progress, [0, 0.15, 1], [0, 1, 0.3]);

  return (
    <div
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        background: primary,
        opacity,
        boxShadow: `0 0 80px 20px ${primary}aa`,
      }}
    />
  );
}

function SpotlightOverlay({
  progress,
  primary,
  background,
  marker,
}: {
  progress: number;
  primary: string;
  background: string;
  marker: Marker;
}) {
  const focus = marker.focus ?? { x: 0.5, y: 0.5, width: 0.35, height: 0.3 };
  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 0.75, 0.75, 0]);
  const ringOpacity = interpolate(progress, [0, 0.25, 1], [0, 1, 0.6]);

  return (
    <>
      <AbsoluteFill
        style={{
          background: background,
          opacity: opacity * 0.65,
          WebkitMaskImage: `radial-gradient(ellipse ${focus.width * 100}% ${focus.height * 100}% at ${focus.x * 100}% ${focus.y * 100}%, transparent 40%, black 75%)`,
          maskImage: `radial-gradient(ellipse ${focus.width * 100}% ${focus.height * 100}% at ${focus.x * 100}% ${focus.y * 100}%, transparent 40%, black 75%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${focus.x * 100}%`,
          top: `${focus.y * 100}%`,
          transform: "translate(-50%, -50%)",
          width: `${focus.width * 100}%`,
          height: `${focus.height * 100}%`,
          borderRadius: 12,
          border: `2px solid ${primary}`,
          opacity: ringOpacity,
          boxShadow: `0 0 40px ${primary}44`,
        }}
      />
    </>
  );
}

// Keep legacy export for compatibility
export { ClickEffects as ClickRipple };
