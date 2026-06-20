import type { ErrorEvent, EventHint } from "@sentry/nextjs";

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const TOKEN_PARAM_PATTERN = /([?&](?:token|access_token|key|secret|password)=)[^&\s]+/gi;
const RECORDING_PATH_PATTERN = /\/(?:recordings?|uploads?|exports?)\/[^\s"'<>]+/gi;

function scrubString(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(TOKEN_PARAM_PATTERN, "$1[redacted]")
    .replace(RECORDING_PATH_PATTERN, "/[redacted-path]");
}

function scrubValue(value: unknown): unknown {
  if (typeof value === "string") return scrubString(value);
  if (Array.isArray(value)) return value.map(scrubValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        scrubValue(v),
      ]),
    );
  }
  return value;
}

function breadcrumbContainsSensitiveData(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("recording") ||
    lower.includes("upload") ||
    lower.includes("export") ||
    EMAIL_PATTERN.test(message)
  );
}

export function sentryBeforeSend(
  event: ErrorEvent,
  hint: EventHint,
): ErrorEvent | null {
  if (event.message) {
    event.message = scrubString(event.message);
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter(
      (crumb) => !breadcrumbContainsSensitiveData(crumb.message),
    );
    event.breadcrumbs = event.breadcrumbs.map((crumb) => ({
      ...crumb,
      message: crumb.message ? scrubString(crumb.message) : crumb.message,
      data: crumb.data ? (scrubValue(crumb.data) as typeof crumb.data) : crumb.data,
    }));
  }

  if (event.request?.url) {
    event.request.url = scrubString(event.request.url);
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }

  if (hint.originalException instanceof Error) {
    hint.originalException.message = scrubString(hint.originalException.message);
  }

  return event;
}
