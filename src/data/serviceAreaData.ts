/**
 * serviceAreaData.ts
 * ---------------------------------------------------------------------------
 * Edit this file to change the service area text and city list.
 *
 * Controls the "Where We Serve" section on the homepage
 * (src/components/home/ServiceAreaSection.tsx).
 * Add or remove cities here — the section updates automatically.
 * ---------------------------------------------------------------------------
 */

export const serviceArea = {
  badge: "Where We Serve",
  title: "Pickup & Local Delivery",
  subtitle: "Serving Lake City and surrounding areas.",

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
};
