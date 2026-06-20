"use server";

import { formatZodError, safeParseFormData } from "@/lib/validations/form-data";
import { waitlistSchema } from "@/lib/validations/waitlist";

export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = safeParseFormData(waitlistSchema, formData);
  if (!parsed.success) {
    return { status: "error", message: formatZodError(parsed.error) };
  }

  const { email } = parsed.data;

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        return {
          status: "error",
          message: "Something went wrong. Try again in a moment.",
        };
      }
    } catch {
      return {
        status: "error",
        message: "Something went wrong. Try again in a moment.",
      };
    }
  }

  return { status: "success" };
}
