export const MUSIC_TRACKS = [
  { id: "modern-saas", label: "Modern SaaS" },
  { id: "ambient-tech", label: "Ambient Tech" },
  { id: "corporate-clean", label: "Corporate Clean" },
  { id: "startup-launch", label: "Startup Launch" },
  { id: "energetic-reveal", label: "Energetic Reveal" },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];
