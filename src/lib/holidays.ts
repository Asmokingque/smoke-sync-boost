// Hard-coded US federal holidays for 2026-2027.
// Admins layer business hours and BBQ specials on top via business_hours_overrides + specials.holiday_key.
export type HolidayCategory = "Federal Holiday" | "Business Observance" | "Local Event" | "Custom BBQ Special";

export type Holiday = {
  key: string;
  name: string;
  date: string; // YYYY-MM-DD
  category: HolidayCategory;
};

export const FEDERAL_HOLIDAYS: Holiday[] = [
  // 2026
  { key: "new-years-2026",      name: "New Year's Day",                 date: "2026-01-01", category: "Federal Holiday" },
  { key: "mlk-2026",            name: "Martin Luther King Jr. Day",     date: "2026-01-19", category: "Federal Holiday" },
  { key: "presidents-2026",     name: "Presidents' Day",                date: "2026-02-16", category: "Federal Holiday" },
  { key: "memorial-2026",       name: "Memorial Day",                   date: "2026-05-25", category: "Federal Holiday" },
  { key: "juneteenth-2026",     name: "Juneteenth",                     date: "2026-06-19", category: "Federal Holiday" },
  { key: "independence-2026",   name: "Independence Day",               date: "2026-07-04", category: "Federal Holiday" },
  { key: "labor-2026",          name: "Labor Day",                      date: "2026-09-07", category: "Federal Holiday" },
  { key: "columbus-2026",       name: "Columbus Day",                   date: "2026-10-12", category: "Federal Holiday" },
  { key: "veterans-2026",       name: "Veterans Day",                   date: "2026-11-11", category: "Federal Holiday" },
  { key: "thanksgiving-2026",   name: "Thanksgiving Day",               date: "2026-11-26", category: "Federal Holiday" },
  { key: "christmas-2026",      name: "Christmas Day",                  date: "2026-12-25", category: "Federal Holiday" },
  // 2027
  { key: "new-years-2027",      name: "New Year's Day",                 date: "2027-01-01", category: "Federal Holiday" },
  { key: "mlk-2027",            name: "Martin Luther King Jr. Day",     date: "2027-01-18", category: "Federal Holiday" },
  { key: "presidents-2027",     name: "Presidents' Day",                date: "2027-02-15", category: "Federal Holiday" },
  { key: "memorial-2027",       name: "Memorial Day",                   date: "2027-05-31", category: "Federal Holiday" },
  { key: "juneteenth-2027",     name: "Juneteenth",                     date: "2027-06-19", category: "Federal Holiday" },
  { key: "independence-2027",   name: "Independence Day",               date: "2027-07-05", category: "Federal Holiday" },
  { key: "labor-2027",          name: "Labor Day",                      date: "2027-09-06", category: "Federal Holiday" },
  { key: "columbus-2027",       name: "Columbus Day",                   date: "2027-10-11", category: "Federal Holiday" },
  { key: "veterans-2027",       name: "Veterans Day",                   date: "2027-11-11", category: "Federal Holiday" },
  { key: "thanksgiving-2027",   name: "Thanksgiving Day",               date: "2027-11-25", category: "Federal Holiday" },
  { key: "christmas-2027",      name: "Christmas Day",                  date: "2027-12-25", category: "Federal Holiday" },
];

export function getHolidayByKey(key: string | null | undefined) {
  if (!key) return undefined;
  return FEDERAL_HOLIDAYS.find((h) => h.key === key);
}

export function getHolidayByDate(dateISO: string) {
  return FEDERAL_HOLIDAYS.find((h) => h.date === dateISO);
}

export function upcomingHolidays(limit = 6, fromDate = new Date()): Holiday[] {
  const today = fromDate.toISOString().slice(0, 10);
  return FEDERAL_HOLIDAYS
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
