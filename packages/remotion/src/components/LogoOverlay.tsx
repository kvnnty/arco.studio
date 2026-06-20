import type { ArcoProject } from "@arco/project-schema";
import { AbsoluteFill, Img } from "remotion";

type LogoOverlayProps = {
  project: ArcoProject;
};

export function LogoOverlay({ project }: LogoOverlayProps) {
  const logoSrc = project.brand?.logoSrc;
  if (!logoSrc) return null;

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
        }}
      />
    </AbsoluteFill>
  );
}
