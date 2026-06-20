import { z } from "zod";

export function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [key, String(value)]),
  );
}

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): z.infer<T> {
  return schema.parse(formDataToObject(formData));
}

export function safeParseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): z.SafeParseReturnType<Record<string, string>, z.infer<T>> {
  return schema.safeParse(formDataToObject(formData));
}
