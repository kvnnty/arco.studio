const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Action types that spend credits (not exports — those are plan-included). */
const CREDIT_SPEND_TYPES = new Set([
  "ai_draft",
  "ai_storyboard",
  "ai_chat",
  "ai_refine",
  "ai_regenerate",
  "voice_generate",
  "voice_preview",
]);

function parseEventAmount(metadata: string | Record<string, unknown> | null | undefined): number {
  if (!metadata) return 1;
  try {
    const parsed =
      typeof metadata === "string" ? (JSON.parse(metadata) as Record<string, unknown>) : metadata;
    const amount = parsed.amount;
    return typeof amount === "number" && amount > 0 ? amount : 1;
  } catch {
    return 1;
  }
}

export function isCreditSpendEventType(type: string): boolean {
  return CREDIT_SPEND_TYPES.has(type);
}

/** Credits spent per day over the last 7 days (AI + voice only). */
export function buildWeeklyCreditSpendChart(
  events: Array<{ type: string; metadata?: string; createdAt: string }>,
): Array<{ day: string; credits: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: Array<{ day: string; credits: number; date: Date }> = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.push({
      day: DAY_LABELS[date.getDay()] ?? "—",
      credits: 0,
      date,
    });
  }

  for (const event of events) {
    if (!isCreditSpendEventType(event.type)) continue;

    const created = new Date(event.createdAt);
    created.setHours(0, 0, 0, 0);

    const bucket = buckets.find(
      (item) => item.date.getTime() === created.getTime(),
    );
    if (bucket) {
      bucket.credits += parseEventAmount(event.metadata);
    }
  }

  return buckets.map(({ day, credits }) => ({ day, credits }));
}
