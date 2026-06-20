import {
  type ArcoProject,
  projectDurationInFrames,
  parseArcoProject,
  type StylePreset,
} from "@arco/project-schema";
import { STYLE_PRESETS } from "@arco/project-schema/style-presets";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ClickEffects } from "./components/ClickRipple";
import { MusicBed } from "./components/MusicBed";
import { RecordingLayer } from "./components/RecordingLayer";
import { TitleCard } from "./components/TitleCard";

export type ArcoCompositionProps = {
  project: ArcoProject;
};

export const defaultArcoProject = parseArcoProject({
  version: "1",
  meta: { title: "Untitled", fps: 30, width: 1920, height: 1080 },
  recording: { src: "placeholder", durationMs: 5000 },
  markers: [],
  stylePreset: "startup",
  exportFormat: "16:9",
});

export function getStyleConfig(project: ArcoProject) {
  const preset = (project.stylePreset ?? "startup") as StylePreset;
  return STYLE_PRESETS[preset];
}

export const ArcoComposition: React.FC<ArcoCompositionProps> = ({
  project,
}) => {
  const frame = useCurrentFrame();
  const style = getStyleConfig(project);
  const primary = project.brand?.primary ?? style.brand.primary;
  const background = project.brand?.background ?? style.brand.background;

  return (
    <AbsoluteFill>
      <RecordingLayer project={project} frame={frame} />
      <MusicBed project={project} />
      {project.markers.map((marker) => (
        <ClickEffects
          key={`effects-${marker.id}`}
          frame={frame}
          fps={project.meta.fps}
          marker={marker}
          primary={primary}
          background={background}
        />
      ))}
      {project.markers.map((marker) => (
        <TitleCard
          key={`title-${marker.id}`}
          frame={frame}
          fps={project.meta.fps}
          marker={marker}
          primary={primary}
          background={background}
          titleSize={style.motion.titleSize}
        />
      ))}
    </AbsoluteFill>
  );
};

export function getArcoCompositionDuration(project: ArcoProject): number {
  return projectDurationInFrames(project);
}
