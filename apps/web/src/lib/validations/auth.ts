import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email.")
  .transform((value) => value.toLowerCase());

export const passwordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export const passwordSignupSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
});
