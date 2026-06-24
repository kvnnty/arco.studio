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
  const customSrc = project.audio?.customMusicSrc;
  const musicId = project.audio?.musicId;
  const volume = musicVolumeForProject(project);

  if (customSrc) {
    return <Audio src={customSrc} volume={volume} />;
  }

  if (!musicId) return null;

  const librarySrc = MUSIC_FILES[musicId];
  if (!librarySrc) return null;

  return <Audio src={staticFile(librarySrc)} volume={volume} />;
}
