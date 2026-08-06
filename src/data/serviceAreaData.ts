/**
 * serviceAreaData.ts
 * ---------------------------------------------------------------------------
 * Controls the "Where We Serve" section on the homepage
 * (src/components/home/ServiceAreaSection.tsx).
 * Add or remove cities here — the section updates automatically.
 * ---------------------------------------------------------------------------
 */

export const serviceArea = {
  badge: "Where We Serve",
  title: "Pickup & Local Delivery",
  subtitle:
    "We proudly serve the surrounding communities with pickup and local delivery. Don't see your city? Reach out — we travel for catering.",

  /** Cities shown as chips */
  cities: [
    "Tampa",
    "Brandon",
    "Riverview",
    "Plant City",
    "Lakeland",
    "Valrico",
    "Seffner",
    "Apollo Beach",
  ],

  /** Delivery details shown as small info cards */
  details: [
    { label: "Delivery Fee", value: "$6.99" },
    { label: "Free Delivery", value: "Orders over $75" },
    { label: "Pickup", value: "Always free" },
  ],

  footnote: "Catering is available beyond this radius — ask us about your event.",
};
