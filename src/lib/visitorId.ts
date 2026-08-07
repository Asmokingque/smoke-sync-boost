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

// Liked review ids are tracked locally: the review_likes table is no longer
// publicly readable, so the browser remembers its own likes.
const LIKES_KEY = "ase_liked_reviews";

export function getLikedReviewIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function setLikedReviewIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — likes just won't persist */
  }
}

