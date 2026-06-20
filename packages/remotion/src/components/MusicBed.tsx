import type { ArcoProject } from "@arco/project-schema";
import { Audio, staticFile } from "remotion";

// Placeholder track (ffmpeg lavfi sine, 90s) — swap for a licensed bed in production.
const MUSIC_FILES: Record<string, string> = {
  "modern-saas": "music/modern-saas.mp3",
  "ambient-tech": "music/modern-saas.mp3",
  "corporate-clean": "music/modern-saas.mp3",
  "startup-launch": "music/modern-saas.mp3",
  "energetic-reveal": "music/modern-saas.mp3",
};

type MusicBedProps = {
  project: ArcoProject;
};

export function MusicBed({ project }: MusicBedProps) {
  const musicId = project.audio?.musicId;
  if (!musicId) return null;

  const src = MUSIC_FILES[musicId];
  if (!src) return null;

  const volume = project.audio?.volume ?? 0.85;

  return <Audio src={staticFile(src)} volume={volume} />;
}
