import type { ArcoProject } from "@arco/project-schema";
import { Audio, staticFile } from "remotion";
import { musicVolumeForProject } from "./VoiceTrack";

const MUSIC_FILES: Record<string, string> = {
  "modern-saas": "music/modern-saas.mp3",
  "ambient-tech": "music/ambient-tech.mp3",
  "corporate-clean": "music/corporate-clean.mp3",
  "startup-launch": "music/startup-launch.mp3",
  "energetic-reveal": "music/energetic-reveal.mp3",
};

type MusicBedProps = {
  project: ArcoProject;
};

export function MusicBed({ project }: MusicBedProps) {
  const musicId = project.audio?.musicId;
  if (!musicId) return null;

  const src = MUSIC_FILES[musicId];
  if (!src) return null;

  const volume = musicVolumeForProject(project);

  return <Audio src={staticFile(src)} volume={volume} />;
}
