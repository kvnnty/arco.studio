import { z } from "zod";

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("That doesn't look like a valid email."),
});
