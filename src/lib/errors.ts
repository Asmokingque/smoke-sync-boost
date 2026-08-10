/**
 * errors.ts
 * Small helper for narrowing `unknown` catch values to a readable message,
 * so we never need `catch (e: any)`.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "string") return error || fallback;
  if (error instanceof Error) return error.message || fallback;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
