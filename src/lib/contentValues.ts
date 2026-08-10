/**
 * contentValues.ts
 * Helpers for reading loosely-shaped CMS content (JSON overrides) in a
 * type-safe way, so admin editors never need `any`.
 */
export type ContentValue =
  | string
  | number
  | boolean
  | null
  | ContentValue[]
  | { [key: string]: ContentValue };

export type ContentMap = Record<string, ContentValue | undefined>;

/** Read a value as a string for form inputs. */
export function asString(value: ContentValue | undefined, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

/** Read a value as a nested object map. */
export function asRecord(value: ContentValue | undefined): Record<string, ContentValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, ContentValue>)
    : {};
}

/** Read a value as a typed list. */
export function asList<T>(value: ContentValue | undefined): T[] {
  return Array.isArray(value) ? (value as unknown as T[]) : [];
}
