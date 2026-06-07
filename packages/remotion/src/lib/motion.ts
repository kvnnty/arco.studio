import type { FocusRegion, Marker } from "@arco/project-schema";
import { DEFAULT_FOCUS } from "@arco/project-schema";
import { Easing, interpolate } from "remotion";

export type CameraTransform = {
  scale: number;
  translateX: number;
  translateY: number;
  originX: string;
  originY: string;
};

export function getActiveCameraTransform(
  frame: number,
  fps: number,
  markers: Marker[],
): CameraTransform {
  let scale = 1;
  let focus: FocusRegion = DEFAULT_FOCUS;

  for (const marker of markers) {
    const zoom = marker.effects.find((e) => e.type === "smooth-zoom");
    if (!zoom) continue;

    const start = Math.round((marker.startMs / 1000) * fps);
    const end = start + Math.round((marker.durationMs / 1000) * fps);
    const target = zoom.scale ?? 1.2;

    if (frame >= start && frame <= end && target > 1.001) {
      const progress = interpolate(frame, [start, end], [0, 1], {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const markerScale = interpolate(progress, [0, 0.35, 1], [1, target, 1]);
      if (markerScale > scale) {
        scale = markerScale;
        focus = marker.focus ?? DEFAULT_FOCUS;
      }
    }
  }

  const originX = `${focus.x * 100}%`;
  const originY = `${focus.y * 100}%`;
  const translateX = (0.5 - focus.x) * (scale - 1) * 100;
  const translateY = (0.5 - focus.y) * (scale - 1) * 100;

  return {
    scale,
    translateX,
    translateY,
    originX,
    originY,
  };
}

export function getActiveZoomScale(
  frame: number,
  fps: number,
  markers: Marker[],
): number {
  return getActiveCameraTransform(frame, fps, markers).scale;
}

export function isMarkerActive(
  frame: number,
  fps: number,
  marker: Marker,
): boolean {
  const start = Math.round((marker.startMs / 1000) * fps);
  const end = start + Math.round((marker.durationMs / 1000) * fps);
  return frame >= start && frame <= end;
}

export function markerProgress(
  frame: number,
  fps: number,
  marker: Marker,
): number {
  const start = Math.round((marker.startMs / 1000) * fps);
  const end = start + Math.round((marker.durationMs / 1000) * fps);
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function getTransitionOpacity(
  frame: number,
  fps: number,
  markers: Marker[],
): number {
  let opacity = 1;

  for (const marker of markers) {
    if (!marker.transition || marker.transition.type === "fade") {
      const start = Math.round((marker.startMs / 1000) * fps);
      const fadeFrames = Math.round(fps * 0.35);
      if (frame >= start && frame < start + fadeFrames) {
        opacity = Math.min(
          opacity,
          interpolate(frame, [start, start + fadeFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        );
      }
    }
  }

  return opacity;
}

export function getTransitionBlur(
  frame: number,
  fps: number,
  markers: Marker[],
): number {
  for (const marker of markers) {
    if (marker.transition?.type !== "blur") continue;
    const start = Math.round((marker.startMs / 1000) * fps);
    const blurFrames = Math.round(fps * 0.4);
    if (frame >= start && frame < start + blurFrames) {
      return interpolate(frame, [start, start + blurFrames], [12, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
  }
  return 0;
}

export function getTransitionSlide(
  frame: number,
  fps: number,
  markers: Marker[],
): number {
  for (const marker of markers) {
    if (marker.transition?.type !== "slide" && marker.transition?.type !== "push")
      continue;
    const start = Math.round((marker.startMs / 1000) * fps);
    const slideFrames = Math.round(fps * 0.45);
    if (frame >= start && frame < start + slideFrames) {
      return interpolate(frame, [start, start + slideFrames], [8, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
  }
  return 0;
}

export function getTransitionScale(
  frame: number,
  fps: number,
  markers: Marker[],
): number {
  for (const marker of markers) {
    if (marker.transition?.type !== "scale" && marker.transition?.type !== "morph")
      continue;
    const start = Math.round((marker.startMs / 1000) * fps);
    const scaleFrames = Math.round(fps * 0.4);
    if (frame >= start && frame < start + scaleFrames) {
      return interpolate(frame, [start, start + scaleFrames], [0.94, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
  }
  return 1;
}
