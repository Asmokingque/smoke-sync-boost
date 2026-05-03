// Specials helpers — windowing, types, formatting.
export type SpecialType = "daily" | "lunch" | "holiday" | "featured" | "catering";

export type Special = {
  id: string;
  type: SpecialType;
  title: string;
  description: string | null;
  special_price: number;
  regular_price: number | null;
  image_url: string | null;
  available_from: string | null;   // YYYY-MM-DD
  available_until: string | null;
  start_time: string | null;       // HH:MM:SS
  end_time: string | null;
  weekdays: number[] | null;       // 0=Sun
  holiday_key: string | null;
  is_active: boolean;
  sold_out: boolean;
  all_day_orderable: boolean;
  display_order: number;
};

export const SPECIAL_TYPE_LABEL: Record<SpecialType, string> = {
  daily: "Daily Special",
  lunch: "Lunch Special",
  holiday: "Holiday Special",
  featured: "Featured Special",
  catering: "Catering Special",
};

function timeStrToMinutes(t: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** True if special is within its date window (or has none). */
export function isInDateWindow(s: Special, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  if (s.available_from && today < s.available_from) return false;
  if (s.available_until && today > s.available_until) return false;
  return true;
}

/** True if today is one of the special's weekdays (or weekdays unset). */
export function isOnWeekday(s: Special, now = new Date()): boolean {
  if (!s.weekdays || s.weekdays.length === 0) return true;
  return s.weekdays.includes(now.getDay());
}

/** True if current time is inside special's daily time window (or unset). */
export function isInTimeWindow(s: Special, now = new Date()): boolean {
  const startM = timeStrToMinutes(s.start_time);
  const endM = timeStrToMinutes(s.end_time);
  if (startM == null || endM == null) return true;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= startM && cur <= endM;
}

/** True if a customer can currently order this special. */
export function isOrderableNow(s: Special, now = new Date()): boolean {
  if (!s.is_active || s.sold_out) return false;
  if (!isInDateWindow(s, now)) return false;
  if (!isOnWeekday(s, now)) return false;
  if (s.all_day_orderable) return true;
  return isInTimeWindow(s, now);
}

/** Should we even show this special on the public site right now?
 *  Lunch specials hide entirely outside their window unless all_day_orderable.
 *  Holiday/daily specials show during their date window even outside time window. */
export function isVisibleNow(s: Special, now = new Date()): boolean {
  if (!s.is_active) return false;
  if (!isInDateWindow(s, now)) return false;
  if (s.type === "lunch" && !s.all_day_orderable) {
    return isOnWeekday(s, now) && isInTimeWindow(s, now);
  }
  return true;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatWeekdays(weekdays: number[] | null): string {
  if (!weekdays || weekdays.length === 7) return "Every day";
  if (weekdays.length === 0) return "—";
  const sorted = [...weekdays].sort();
  // Detect Mon-Fri
  if (sorted.length === 5 && sorted.every((d, i) => d === i + 1)) return "Mon – Fri";
  if (sorted.length === 2 && sorted[0] === 0 && sorted[1] === 6) return "Weekends";
  return sorted.map((d) => DAY_NAMES[d]).join(", ");
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start || !end) return "All day";
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1;
    return m === 0 ? `${hh} ${ampm}` : `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}
