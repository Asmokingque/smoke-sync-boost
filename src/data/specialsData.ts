/**
 * specialsData.ts
 * ---------------------------------------------------------------------------
 * Fallback specials + the copy used by specials sections.
 * Live specials come from the database; these render when it's unavailable.
 * ---------------------------------------------------------------------------
 */

export const specialsCopy = {
  dailyBadge: "Today Only",
  dailyTitle: "Today's Smokehouse Special",
  dailySubtitle: "Fresh from the pit. Available for a limited time.",
  dailyEmptyText:
    "No daily special posted right now — check back soon, or browse the full menu.",

  lunchBadge: "Mon – Fri · 11 AM – 2 PM",
  lunchTitle: "Lunch Specials",
  lunchSubtitle: "Midday smokehouse favorites served fast, fresh, and bold.",
};

export type FallbackSpecial = {
  id: string;
  type: "daily" | "lunch" | "holiday" | "featured" | "catering";
  title: string;
  description: string | null;
  special_price: number;
  regular_price: number | null;
  image_url: string | null;
  is_active: boolean;
  sold_out: boolean;
  all_day_orderable: boolean;
  display_order: number;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  available_from: string | null;
  available_until: string | null;
  holiday_key: string | null;
};

const base = {
  is_active: true,
  sold_out: false,
  all_day_orderable: true,
  weekdays: null,
  start_time: null,
  end_time: null,
  available_from: null,
  available_until: null,
  holiday_key: null,
  image_url: null,
};

export const fallbackSpecials: FallbackSpecial[] = [
  { ...base, id: "sp-daily", type: "daily", title: "Pitmaster's Brisket Plate", description: "Sliced brisket, two sides, cornbread and sweet tea.", special_price: 16.99, regular_price: 21.99, display_order: 1 },
  { ...base, id: "sp-lunch-1", type: "lunch", title: "Pulled Pork Lunch Box", description: "Pulled pork, one side and cornbread.", special_price: 11.99, regular_price: 14.99, display_order: 1 },
  { ...base, id: "sp-lunch-2", type: "lunch", title: "Wing Basket Lunch", description: "Six smoked wings with fries.", special_price: 10.99, regular_price: 13.99, display_order: 2 },
  { ...base, id: "sp-lunch-3", type: "lunch", title: "Rib Tip Lunch Plate", description: "Rib tips, one side and cornbread.", special_price: 12.99, regular_price: 15.99, display_order: 3 },
];
