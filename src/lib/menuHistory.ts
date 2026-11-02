/**
 * menuHistory.ts
 * Pure helpers for the menu change history + one-click undo.
 * The database trigger records every menu item create/update/delete.
 */
export type MenuHistoryAction = "create" | "update" | "delete";

export type MenuHistoryEntry = {
  id: string;
  menu_item_id: string;
  item_name: string;
  action: MenuHistoryAction;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by_email: string | null;
  undone_at: string | null;
  created_at: string;
};

/** Fields that never get restored (managed by the database). */
const SKIP = new Set(["id", "created_at", "updated_at"]);

/** Fields shown in the history list; anything else is summarised. */
export const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  description: "Description",
  price: "Price",
  price_alt: "Alt price",
  price_label: "Price label",
  image_url: "Photo",
  is_available: "Available",
  is_featured: "Featured",
  is_sold_out: "Sold out",
  is_popular: "Popular",
  online_ordering_enabled: "Online ordering",
  display_order: "Display order",
  category_id: "Category",
  requires_options: "Requires options",
  allow_notes: "Allow notes",
};

export type FieldChange = { field: string; label: string; from: unknown; to: unknown };

export function changedFields(entry: Pick<MenuHistoryEntry, "old_data" | "new_data">): FieldChange[] {
  const a = entry.old_data ?? {};
  const b = entry.new_data ?? {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: FieldChange[] = [];
  for (const k of keys) {
    if (SKIP.has(k)) continue;
    if (JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null)) continue;
    out.push({ field: k, label: FIELD_LABELS[k] ?? k, from: a[k] ?? null, to: b[k] ?? null });
  }
  return out;
}

export type UndoPlan =
  | { kind: "update"; id: string; values: Record<string, unknown> }
  | { kind: "insert"; values: Record<string, unknown> }
  | { kind: "delete"; id: string };

/** Work out what has to happen to reverse one history entry. */
export function undoPlan(entry: MenuHistoryEntry): UndoPlan {
  if (entry.action === "create") return { kind: "delete", id: entry.menu_item_id };
  const old = entry.old_data ?? {};
  if (entry.action === "delete") {
    const values = { ...old };
    delete values.created_at;
    delete values.updated_at;
    return { kind: "insert", values };
  }
  const values: Record<string, unknown> = {};
  for (const c of changedFields(entry)) values[c.field] = c.from;
  return { kind: "update", id: entry.menu_item_id, values };
}

export function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
