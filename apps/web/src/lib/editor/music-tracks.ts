export const MUSIC_TRACKS = [
  {
    id: "modern-saas",
    label: "Modern SaaS",
    mood: "UPBEAT",
    durationSec: 90,
    previewUrl: "/music/modern-saas.mp3",
  },
  {
    id: "ambient-tech",
    label: "Ambient Tech",
    mood: "STEADY",
    durationSec: 90,
    previewUrl: "/music/ambient-tech.mp3",
  },
  {
    id: "corporate-clean",
    label: "Corporate Clean",
    mood: "BRIGHT",
    durationSec: 90,
    previewUrl: "/music/corporate-clean.mp3",
  },
  {
    id: "startup-launch",
    label: "Startup Launch",
    mood: "WARM",
    durationSec: 90,
    previewUrl: "/music/startup-launch.mp3",
  },
  {
    id: "energetic-reveal",
    label: "Energetic Reveal",
    mood: "DRIVING",
    durationSec: 90,
    previewUrl: "/music/energetic-reveal.mp3",
  },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];

export function getMusicTrack(id: string | null | undefined) {
  if (!id) return null;
  return MUSIC_TRACKS.find((track) => track.id === id) ?? null;
}

export const MUSIC_FILE_BY_ID: Record<MusicTrackId, string> = {
  "modern-saas": "music/modern-saas.mp3",
  "ambient-tech": "music/ambient-tech.mp3",
  "corporate-clean": "music/corporate-clean.mp3",
  "startup-launch": "music/startup-launch.mp3",
  "energetic-reveal": "music/energetic-reveal.mp3",
};
