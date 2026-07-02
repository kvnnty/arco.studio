export function formatDurationLimit(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatDurationLimitLabel(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes >= 1 && ms % 60_000 === 0) {
    return `${minutes} min`;
  }
  return formatDurationLimit(ms);
}

export function isOverDurationLimit(
  durationMs: number,
  maxMs: number,
): boolean {
  return maxMs > 0 && durationMs > maxMs;
}

export function durationLimitError(
  durationMs: number,
  maxMs: number,
  plan: string | null,
): string {
  const actual = formatDurationLimit(durationMs);
  const limit = formatDurationLimitLabel(maxMs);

  if (plan === "trial") {
    return `This recording is ${actual}. Intro supports up to ${limit}. Upgrade to Pro for videos up to 5 minutes.`;
  }

  if (plan === "pro") {
    return `This recording is ${actual}. Pro supports up to ${limit}. Upgrade to Studio for videos up to 10 minutes.`;
  }

  return `This video is ${actual}, which exceeds your plan limit of ${limit}.`;
}

export function assertWithinDurationLimit(
  durationMs: number,
  maxMs: number,
  plan: string | null,
): void {
  if (isOverDurationLimit(durationMs, maxMs)) {
    throw new Error(durationLimitError(durationMs, maxMs, plan));
  }
}
