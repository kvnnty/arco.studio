export function authErrorMessage(
  error: unknown,
  fallback = "Authentication could not be completed. Try again.",
) {
  if (!error || typeof error !== "object") return fallback;

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if ("errors" in error && Array.isArray(error.errors)) {
    const first = error.errors[0];
    if (first && typeof first === "object" && "message" in first) {
      return String(first.message);
    }
  }

  return fallback;
}
