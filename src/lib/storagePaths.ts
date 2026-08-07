/**
 * storagePaths.ts
 * Bucket registry + slug/path helpers for admin image uploads.
 * All paths are lowercase, hyphenated and stripped of special characters.
 */

export const IMAGE_BUCKETS = {
  "menu-images": { public: true },
  "site-images": { public: false },
  "specials-images": { public: false },
  "review-photos": { public: true },
  "experience-photos": { public: true },
  "catering-uploads": { public: false },
} as const;

export type ImageBucket = keyof typeof IMAGE_BUCKETS;

export const isPublicBucket = (bucket: string) =>
  IMAGE_BUCKETS[bucket as ImageBucket]?.public ?? false;

/** "Brisket & Ribs (XL)" -> "brisket-ribs-xl" */
export function slugify(value: string, fallback = "item"): string {
  const slug = (value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

/** Keeps the extension, slugifies the base name. */
export function slugifyFileName(name: string): string {
  const ext = (name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = slugify(name.replace(/\.[^.]+$/, ""), "image");
  return `${base}.${ext || "jpg"}`;
}

const stamp = () => Date.now();

/** menu-images/{category-slug}/{item-slug}/{timestamp}-{file-name} */
export const menuItemPath = (categorySlug: string, itemSlug: string, fileName: string) =>
  `${slugify(categorySlug, "uncategorized")}/${slugify(itemSlug, "item")}/${stamp()}-${slugifyFileName(fileName)}`;

/** site-images/{section-key}/{timestamp}-{file-name} */
export const sitePath = (sectionKey: string, fileName: string) =>
  `${slugify(sectionKey, "general")}/${stamp()}-${slugifyFileName(fileName)}`;

/** specials-images/{special-type}/{special-slug}/{timestamp}-{file-name} */
export const specialPath = (specialType: string, specialSlug: string, fileName: string) =>
  `${slugify(specialType, "featured")}/${slugify(specialSlug, "special")}/${stamp()}-${slugifyFileName(fileName)}`;

/** Generic: {folder}/{timestamp}-{file-name} */
export const folderPath = (folder: string, fileName: string) =>
  `${slugify(folder, "uploads")}/${stamp()}-${slugifyFileName(fileName)}`;
