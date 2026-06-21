import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const passwordRegisterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const profileSchema = z.object({
  name: z.string().trim().max(120).optional(),
});
