/**
 * holidayData.ts
 * ---------------------------------------------------------------------------
 * Copy for the holiday calendar section + fallback holiday entries used when
 * the database is unavailable.
 * ---------------------------------------------------------------------------
 */

export const holidayCopy = {
  badge: "On the Calendar",
  title: "Upcoming Holidays",
  subtitle: "Plan ahead — our holiday hours and BBQ specials.",
};

export type FallbackHoliday = {
  id: string;
  holiday_name: string;
  /** ISO date, e.g. "2026-07-04" */
  holiday_date: string;
  business_status: string | null;
  banner_message: string | null;
};

export const fallbackHolidays: FallbackHoliday[] = [
  { id: "hol-1", holiday_name: "Memorial Day", holiday_date: "2026-05-25", business_status: "Special Hours", banner_message: "Pre-order trays by Friday." },
  { id: "hol-2", holiday_name: "Juneteenth", holiday_date: "2026-06-19", business_status: "Open", banner_message: "Celebration plates all day." },
  { id: "hol-3", holiday_name: "Independence Day", holiday_date: "2026-07-04", business_status: "Special Hours", banner_message: "Whole briskets available — order early." },
];
