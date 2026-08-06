/**
 * menuData.ts
 * ---------------------------------------------------------------------------
 * FALLBACK menu used when the backend (Lovable Cloud / Supabase) is not
 * connected or returns no rows — e.g. running locally after export.
 *
 * Live data always wins. The admin dashboard edits the database, not this file.
 * Developers can edit this file freely for local design work.
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
  /** Main price in dollars */
  price: number | null;
  /** Optional second price (e.g. half pound) */
  price_alt: number | null;
  /** Label shown next to price, e.g. "per lb" */
  price_label: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  requires_options: boolean;
  allow_notes: boolean;
};

export const fallbackCategories: FallbackCategory[] = [
  { id: "cat-bbq-lb", name: "BBQ By The Pound", slug: "bbq-by-the-pound", display_order: 1, description: "Sold by the pound, straight from the pit." },
  { id: "cat-plates", name: "BBQ Plates", slug: "bbq-plates", display_order: 2, description: "Meat plus Southern sides and cornbread." },
  { id: "cat-ribs", name: "Ribs", slug: "ribs", display_order: 3, description: "Hand-rubbed and smoked low." },
  { id: "cat-chicken", name: "Smoked Chicken", slug: "smoked-chicken", display_order: 4, description: "Wings, halves and quarters." },
  { id: "cat-sides", name: "Premium Sides", slug: "premium-sides", display_order: 5, description: "Made fresh daily." },
  { id: "cat-desserts", name: "Desserts", slug: "desserts", display_order: 6, description: "Southern sweets." },
  { id: "cat-drinks", name: "Drinks", slug: "drinks", display_order: 7, description: "Sweet tea, lemonade and sodas." },
];

const base = {
  price_alt: null,
  price_label: null,
  image_url: null,
  is_available: true,
  is_featured: false,
  requires_options: false,
  allow_notes: true,
};

export const fallbackMenuItems: FallbackMenuItem[] = [
  { ...base, id: "itm-brisket", category_id: "cat-bbq-lb", name: "Smoked Brisket", description: "Hardwood-smoked brisket, sliced fresh and sold by the pound.", price: 28, price_label: "per lb", display_order: 1, is_featured: true },
  { ...base, id: "itm-pulled-pork", category_id: "cat-bbq-lb", name: "Pulled Pork", description: "Slow-smoked pork shoulder, pulled and lightly sauced.", price: 20, price_label: "per lb", display_order: 2 },
  { ...base, id: "itm-burnt-ends", category_id: "cat-bbq-lb", name: "Burnt Ends", description: "Cubed brisket point, caramelized in sweet-heat glaze.", price: 30, price_label: "per lb", display_order: 3, is_featured: true },

  { ...base, id: "itm-plate-1", category_id: "cat-plates", name: "One Meat Plate", description: "One smoked meat, two Southern sides and cornbread.", price: 15, display_order: 1, requires_options: true },
  { ...base, id: "itm-plate-2", category_id: "cat-plates", name: "Two Meat Plate", description: "Your choice of two slow-smoked meats with two sides and cornbread.", price: 19, display_order: 2, requires_options: true, is_featured: true },
  { ...base, id: "itm-plate-3", category_id: "cat-plates", name: "Three Meat Plate", description: "Three smoked meats, two sides and cornbread.", price: 24, display_order: 3, requires_options: true },

  { ...base, id: "itm-ribs-half", category_id: "cat-ribs", name: "St. Louis Pork Ribs (Half Slab)", description: "Hand-rubbed and smoked low until tender.", price: 22, display_order: 1, is_featured: true },
  { ...base, id: "itm-ribs-full", category_id: "cat-ribs", name: "St. Louis Pork Ribs (Full Slab)", description: "A full slab for the table.", price: 38, display_order: 2 },
  { ...base, id: "itm-beef-ribs", category_id: "cat-ribs", name: "Beef Ribs", description: "Big, beefy and heavily barked.", price: 16, price_label: "each", display_order: 3 },

  { ...base, id: "itm-wings", category_id: "cat-chicken", name: "Smoked Chicken Wings", description: "Smoked then finished crisp, tossed in house sauce.", price: 14.99, display_order: 1, is_featured: true },
  { ...base, id: "itm-half-chicken", category_id: "cat-chicken", name: "Smoked Half Chicken", description: "Juicy half bird with a mahogany smoke crust.", price: 13, display_order: 2 },

  { ...base, id: "itm-mac", category_id: "cat-sides", name: "Smoked Mac & Cheese", description: "Three-cheese blend finished in the smoker.", price: 5, display_order: 1 },
  { ...base, id: "itm-beans", category_id: "cat-sides", name: "Brisket Baked Beans", description: "Slow-simmered with chopped brisket.", price: 5, display_order: 2 },
  { ...base, id: "itm-slaw", category_id: "cat-sides", name: "Creamy Coleslaw", description: "Cool, crisp and tangy.", price: 4, display_order: 3 },
  { ...base, id: "itm-greens", category_id: "cat-sides", name: "Collard Greens", description: "Braised low with smoked turkey.", price: 5, display_order: 4 },

  { ...base, id: "itm-banana-pudding", category_id: "cat-desserts", name: "Banana Pudding", description: "Layered vanilla wafers and fresh bananas.", price: 6, display_order: 1 },
  { ...base, id: "itm-peach-cobbler", category_id: "cat-desserts", name: "Peach Cobbler", description: "Warm, buttery and Southern.", price: 6, display_order: 2 },

  { ...base, id: "itm-sweet-tea", category_id: "cat-drinks", name: "Sweet Tea", description: "Brewed fresh daily.", price: 3, display_order: 1 },
  { ...base, id: "itm-lemonade", category_id: "cat-drinks", name: "Lemonade", description: "Hand-squeezed.", price: 3, display_order: 2 },
];
