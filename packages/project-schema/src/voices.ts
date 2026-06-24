/** ElevenLabs voice catalog — IDs from ElevenLabs voice library. */
export const ARCO_VOICES = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    accent: "American",
    gender: "female",
    previewText: "Ship your next launch video in minutes, not days.",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    accent: "American",
    gender: "male",
    previewText: "Built for founders who move fast and ship often.",
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    accent: "American",
    gender: "male",
    previewText: "Turn your product screenshots into a polished demo.",
  },
  {
    id: "MF3mGyEYCl7XYWbV9V6O",
    name: "Elli",
    accent: "American",
    gender: "female",
    previewText: "Your app deserves a launch video that feels designed.",
  },
] as const;

export type ArcoVoiceId = (typeof ARCO_VOICES)[number]["id"];

export function getDefaultVoiceId(): ArcoVoiceId {
  return ARCO_VOICES[0].id;
}

export function resolveVoiceId(id: string | undefined): ArcoVoiceId {
  if (id && ARCO_VOICES.some((v) => v.id === id)) {
    return id as ArcoVoiceId;
  }
  return getDefaultVoiceId();
}

export function getVoiceById(id: string | undefined) {
  if (!id) return null;
  return ARCO_VOICES.find((voice) => voice.id === id) ?? null;
}
