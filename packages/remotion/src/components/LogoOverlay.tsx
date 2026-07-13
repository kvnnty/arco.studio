import type { ArcoProject } from "@arco/project-schema";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";

type LogoOverlayProps = {
  project: ArcoProject;
};

export function LogoOverlay({ project }: LogoOverlayProps) {
  const logoSrc = project.brand?.logoSrc;
  if (!logoSrc) return null;

  const frame = useCurrentFrame();
  const introScale = interpolate(frame, [0, 15], [0.85, 1], {
    extrapolateRight: "clamp",
  });
  const introOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img
        src={logoSrc}
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          width: 120,
          height: 48,
          objectFit: "contain",
          opacity: introOpacity,
          transform: `scale(${introScale})`,
          transformOrigin: "top left",
        }}
      />
    </AbsoluteFill>
  );
}
