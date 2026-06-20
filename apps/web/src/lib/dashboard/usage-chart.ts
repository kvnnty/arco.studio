const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildWeeklyExportChart(
  events: Array<{ type: string; createdAt: string }>,
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
    if (event.type !== "export") continue;

    const created = new Date(event.createdAt);
    created.setHours(0, 0, 0, 0);

    const bucket = buckets.find(
      (item) => item.date.getTime() === created.getTime(),
    );
    if (bucket) {
      bucket.credits += 1;
    }
  }

  return buckets.map(({ day, credits }) => ({ day, credits }));
}
