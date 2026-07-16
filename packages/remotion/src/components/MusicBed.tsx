import type { ArcoProject } from "@arco/project-schema";
import { Audio, staticFile, useCurrentFrame } from "remotion";

import { musicVolumeAtFrame } from "./VoiceTrack";

const MUSIC_FILES: Record<string, string> = {
  "warm-launch": "music/warm-launch.mp3",
  "bright-pulse": "music/bright-pulse.mp3",
  "launch-drive": "music/launch-drive.mp3",
  "calm-focus": "music/calm-focus.mp3",
  "mountain-rise": "music/mountain-rise.mp3",
  "up-bit": "music/up-bit.mp3",
};

type MusicBedProps = {
  project: ArcoProject;
};

export function MusicBed({ project }: MusicBedProps) {
  const frame = useCurrentFrame();
  const volume = musicVolumeAtFrame(project, frame);
  const customSrc = project.audio?.customMusicSrc;
  const musicId = project.audio?.musicId;

  if (customSrc) {
    return <Audio src={customSrc} volume={volume} />;
  }

  if (!musicId) return null;

  const librarySrc = MUSIC_FILES[musicId];
  if (!librarySrc) return null;

  return <Audio src={staticFile(librarySrc)} volume={volume} />;
}
