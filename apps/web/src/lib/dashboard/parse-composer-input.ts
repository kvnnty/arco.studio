const URL_LINE =
  /^(https?:\/\/[^\s]+|(?:www\.)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:\/[^\s]*)?)$/i;

const INLINE_HTTP_URL = /https?:\/\/[^\s]+/i;

export function isLikelyUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  if (!URL_LINE.test(trimmed)) return false;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeProductUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function parseComposerInput(value: string): {
  productUrl?: string;
  brief?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) return {};

  if (isLikelyUrl(trimmed)) {
    return { productUrl: normalizeProductUrl(trimmed) };
  }

  const lines = trimmed.split(/\r?\n/);
  const firstLine = lines[0]?.trim() ?? "";
  if (isLikelyUrl(firstLine) && lines.length > 1) {
    const rest = lines.slice(1).join("\n").trim();
    return {
      productUrl: normalizeProductUrl(firstLine),
      brief: rest || undefined,
    };
  }

  const httpMatch = trimmed.match(INLINE_HTTP_URL);
  if (httpMatch?.[0] && isLikelyUrl(httpMatch[0])) {
    const url = normalizeProductUrl(httpMatch[0]);
    const brief = trimmed.replace(httpMatch[0], " ").replace(/\s+/g, " ").trim();
    return {
      productUrl: url,
      brief: brief || undefined,
    };
  }

  return { brief: trimmed };
}

export function extractComposerUrl(value: string): string | null {
  const parsed = parseComposerInput(value);
  return parsed.productUrl ?? null;
}
