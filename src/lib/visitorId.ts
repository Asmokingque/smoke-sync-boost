// Stable per-browser anonymous ID for review likes.
const KEY = "ase_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(KEY, id);
  }
  return id;
}
