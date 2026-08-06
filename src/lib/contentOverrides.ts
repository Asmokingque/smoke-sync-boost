/**
 * contentOverrides.ts
 * ---------------------------------------------------------------------------
 * Bridges the editable data files (src/data/*.ts) with the admin dashboard.
 *
 * How it works:
 *   1. src/data/siteContent.ts / menuData.ts / theme.ts are the DEFAULTS.
 *   2. Admins edit values at /admin/content — those edits are stored in the
 *      backend table `content_overrides` (one row per file).
 *   3. At runtime the overrides are deep-merged on top of the defaults, so the
 *      live site updates without a redeploy.
 *   4. The admin dashboard can also DOWNLOAD the merged result as a real .ts
 *      file, so an exported codebase can be kept in sync.
 * ---------------------------------------------------------------------------
 */
import { supabase } from "@/integrations/supabase/client";
import { siteContent } from "@/data/siteContent";
import { theme } from "@/data/theme";
import { fallbackCategories, fallbackMenuItems } from "@/data/menuData";

export const CONTENT_KEYS = ["siteContent", "menuData", "theme"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export type MenuDataShape = {
  categories: typeof fallbackCategories;
  items: typeof fallbackMenuItems;
};

/** Plain-JSON defaults for each editable file. */
export const contentDefaults = {
  siteContent: JSON.parse(JSON.stringify(siteContent)) as Record<string, unknown>,
  menuData: {
    categories: JSON.parse(JSON.stringify(fallbackCategories)),
    items: JSON.parse(JSON.stringify(fallbackMenuItems)),
  } as unknown as Record<string, unknown>,
  theme: JSON.parse(JSON.stringify(theme)) as Record<string, unknown>,
};

export const contentMeta: Record<ContentKey, { label: string; file: string; hint: string }> = {
  siteContent: {
    label: "Site Content",
    file: "src/data/siteContent.ts",
    hint: "Business info, homepage hero, favorites, footer and button labels.",
  },
  menuData: {
    label: "Fallback Menu",
    file: "src/data/menuData.ts",
    hint: "Menu shown when the live database has no items (e.g. exported code running locally).",
  },
  theme: {
    label: "Theme Tokens",
    file: "src/data/theme.ts",
    hint: "Shared class tokens for fonts, buttons, spacing, radius and cards.",
  },
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep merge `override` on top of `base`. Arrays are replaced wholesale. */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : (override as T));
  }
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = isPlainObject(v) && isPlainObject(base[k]) ? deepMerge(base[k], v) : v;
  }
  return out as T;
}

export type OverrideMap = Partial<Record<ContentKey, Record<string, unknown>>>;

export async function fetchOverrides(): Promise<OverrideMap> {
  try {
    const { data, error } = await supabase
      .from("content_overrides")
      .select("content_key, content_value");
    if (error || !data) return {};
    const map: OverrideMap = {};
    for (const row of data) {
      if ((CONTENT_KEYS as readonly string[]).includes(row.content_key)) {
        map[row.content_key as ContentKey] = row.content_value as Record<string, unknown>;
      }
    }
    return map;
  } catch {
    return {};
  }
}

export async function saveOverride(key: ContentKey, value: Record<string, unknown>) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("content_overrides")
    .upsert(
      { content_key: key, content_value: value, updated_by: userData.user?.id ?? null },
      { onConflict: "content_key" }
    );
  if (error) throw error;
}

export async function resetOverride(key: ContentKey) {
  const { error } = await supabase.from("content_overrides").delete().eq("content_key", key);
  if (error) throw error;
}

/* -------------------------------------------------------------------------
 * .ts file generation (for exported codebases)
 * ---------------------------------------------------------------------- */

function literal(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((v) => padIn + literal(v, indent + 1)).join(",\n")}\n${pad}]`;
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries
      .map(([k, v]) => `${padIn}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${literal(v, indent + 1)}`)
      .join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

export function generateTsFile(key: ContentKey, value: Record<string, unknown>): string {
  if (key === "siteContent") {
    return `/**
 * siteContent.ts
 * ---------------------------------------------------------------------------
 * Edit this file to change the homepage text.
 * Generated from the admin dashboard (/admin/content).
 * ---------------------------------------------------------------------------
 */

export const siteContent = ${literal(value)} as const;

export type SiteContent = typeof siteContent;
`;
  }

  if (key === "theme") {
    return `/**
 * theme.ts
 * ---------------------------------------------------------------------------
 * Edit this file to change colors, spacing and shared style classes.
 * Generated from the admin dashboard (/admin/content).
 * ---------------------------------------------------------------------------
 */

export const theme = ${literal(value)} as const;

export type Theme = typeof theme;
`;
  }

  const menu = value as unknown as MenuDataShape;
  return `/**
 * menuData.ts
 * ---------------------------------------------------------------------------
 * Edit this file to change fallback menu items.
 * Generated from the admin dashboard (/admin/content).
 * ---------------------------------------------------------------------------
 */

export type FallbackCategory = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  description: string | null;
};

export type FallbackMenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_alt: number | null;
  price_label: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  requires_options: boolean;
  allow_notes: boolean;
};

export const fallbackCategories: FallbackCategory[] = ${literal(menu.categories ?? [])};

export const fallbackMenuItems: FallbackMenuItem[] = ${literal(menu.items ?? [])};
`;
}

export function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
