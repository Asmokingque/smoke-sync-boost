/**
 * homepageLayout.ts
 * ---------------------------------------------------------------------------
 * Controls which homepage sections are shown and in what order.
 *
 * These are DEFAULTS only — admins change visibility and order at
 * /admin/homepage and the live site picks the changes up without a redeploy.
 * ---------------------------------------------------------------------------
 */

export type HomepageSectionId =
  | "hero"
  | "featuredSpecial"
  | "signatureFavorites"
  | "serviceArea"
  | "lunchSpecials"
  | "upcomingHolidays"
  | "communityHeroes"
  | "cateringPreview"
  | "experiencePreview";

export type HomepageSection = {
  id: HomepageSectionId;
  label: string;
  visible: boolean;
};

export const homepageLayout: { sections: HomepageSection[] } = {
  sections: [
    { id: "hero", label: "Hero", visible: true },
    { id: "featuredSpecial", label: "Featured Special", visible: true },
    { id: "signatureFavorites", label: "Signature Favorites", visible: true },
    { id: "serviceArea", label: "Service Area", visible: true },
    { id: "lunchSpecials", label: "Lunch Specials", visible: true },
    { id: "upcomingHolidays", label: "Upcoming Holidays", visible: true },
    { id: "communityHeroes", label: "Community Heroes", visible: true },
    { id: "cateringPreview", label: "Catering Preview", visible: true },
    { id: "experiencePreview", label: "Experience Wall Preview", visible: true },
  ],
};

export type HomepageLayout = typeof homepageLayout;
