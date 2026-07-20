export const MUSIC_TRACKS = [
  {
    id: "warm-launch",
    label: "Warm Launch",
    description: "Polished, optimistic bed for SaaS announcements.",
    mood: "WARM",
    durationSec: 76,
    volume: 0.25,
    file: "music/warm-launch.mp3",
  },
  {
    id: "bright-pulse",
    label: "Bright Pulse",
    description: "Upbeat electronic pulse for energetic product demos.",
    mood: "BRIGHT",
    durationSec: 65,
    volume: 0.25,
    file: "music/bright-pulse.mp3",
  },
  {
    id: "launch-drive",
    label: "Launch Drive",
    description: "Driving commercial bed for fast-paced launch stories.",
    mood: "DRIVING",
    durationSec: 71,
    volume: 0.25,
    file: "music/launch-drive.mp3",
  },
  {
    id: "calm-focus",
    label: "Calm Focus",
    description: "Light, steady background for quieter product walkthroughs.",
    mood: "STEADY",
    durationSec: 117,
    volume: 0.25,
    file: "music/calm-focus.mp3",
  },
  {
    id: "mountain-rise",
    label: "Mountain Rise",
    description: "Cinematic lift for launches that need a bigger finish.",
    mood: "CINEMATIC",
    durationSec: 86,
    volume: 0.25,
    file: "music/mountain-rise.mp3",
  },
  {
    id: "up-bit",
    label: "Up Bit",
    description: "Playful bit-pop bed for fast, light launches.",
    mood: "UPBEAT",
    durationSec: 67,
    volume: 0.25,
    file: "music/up-bit.mp3",
  },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];

export const DEFAULT_MUSIC_TRACK_ID: MusicTrackId = "warm-launch";

export const MUSIC_FILE_BY_ID: Record<MusicTrackId, string> = Object.fromEntries(
  MUSIC_TRACKS.map((track) => [track.id, track.file]),
) as Record<MusicTrackId, string>;

export function getMusicTrack(id: string | null | undefined) {
  if (!id) return null;
  return MUSIC_TRACKS.find((track) => track.id === id) ?? null;
}
