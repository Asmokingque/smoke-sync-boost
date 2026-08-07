/**
 * serviceAreaData.ts
 * ---------------------------------------------------------------------------
 * Defaults for the "Where We Serve" section (src/components/home/ServiceAreaSection.tsx)
 * and the footer service-area wording.
 *
 * These are DEFAULTS only — the live site reads admin edits from the backend
 * (/admin/service-area) and merges them on top of this file.
 * ---------------------------------------------------------------------------
 */

export const serviceArea = {
  badge: "Where We Serve",
  title: "Pickup & Local Delivery",
  subtitle: "Serving Lake City and surrounding areas.",

  /** Primary location */
  city: "Lake City",
  state: "FL",

  /** Map center + zoom (used by any map embed) */
  mapLat: 30.1897,
  mapLng: -82.6393,
  mapZoom: 11,

  /** Cities shown as chips */
  cities: [
    "Lake City",
    "Live Oak",
    "Fort White",
    "High Springs",
    "Branford",
    "Wellborn",
    "White Springs",
    "Alachua",
  ],

  /** Delivery details shown as small info cards */
  details: [
    { label: "Delivery Fee", value: "$6.99" },
    { label: "Free Delivery", value: "Orders over $75" },
    { label: "Pickup", value: "Always free" },
  ],

  footnote: "Catering is available beyond this radius — ask us about your event.",

  /** Short line shown in the site footer */
  footerText: "Serving Lake City and surrounding areas.",
};

export type ServiceArea = typeof serviceArea;
