// Stable per-browser anonymous ID for review likes.
const KEY = "ase_visitor_id";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Random UUID v4 fallback for browsers without crypto.randomUUID.
function randomUuid(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(KEY);
  // The visitor id acts as a secret bearer token for like/unlike, so it must be
  // a full-entropy UUID — legacy or short values are regenerated.
  if (!id || !UUID_RE.test(id)) {
    id = randomUuid();
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

