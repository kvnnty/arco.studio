import {
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
} from "./constants";
import type { ConsentCategories, ConsentChoices, ConsentRecord } from "./types";

function parseConsentCookie(raw: string): ConsentRecord | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentRecord;
    if (
      typeof parsed.version !== "number" ||
      !parsed.categories ||
      parsed.categories.essential !== true
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readConsentCookie(): ConsentRecord | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!match) return null;

  const value = match.slice(CONSENT_COOKIE_NAME.length + 1);
  const record = parseConsentCookie(value);

  if (!record || record.version < CONSENT_VERSION) return null;
  return record;
}

export function writeConsentCookie(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = {
    categories: { ...categories, essential: true },
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  const encoded = encodeURIComponent(JSON.stringify(record));
  document.cookie = `${CONSENT_COOKIE_NAME}=${encoded}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;

  return record;
}

export function hasConsentChoice(): boolean {
  return readConsentCookie() !== null;
}

export function acceptAllConsent(): ConsentRecord {
  return writeConsentCookie({
    essential: true,
    functional: true,
    analytics: true,
    monitoring: true,
  });
}

export function rejectNonEssentialConsent(): ConsentRecord {
  return writeConsentCookie({
    essential: true,
    functional: false,
    analytics: false,
    monitoring: false,
  });
}

export function saveConsentChoices(choices: ConsentChoices): ConsentRecord {
  return writeConsentCookie({
    essential: true,
    ...choices,
  });
}

export const defaultConsentCategories: ConsentCategories = {
  essential: true,
  functional: false,
  analytics: false,
  monitoring: false,
};
