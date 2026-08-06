/**
 * cateringData.ts
 * ---------------------------------------------------------------------------
 * Catering copy + package tiers. Used by the homepage catering preview and
 * the /catering page.
 * ---------------------------------------------------------------------------
 */

export const cateringCopy = {
  badge: "Catering",
  title: "An Event Worth Remembering",
  subtitle:
    "Birthdays, reunions, corporate lunches, weddings — we bring the smokehouse to you with bold flavor and full-service hospitality.",
  ctaLabel: "Request Catering",
};

export type CateringPackage = {
  id: string;
  name: string;
  guests: string;
  pricePerPerson: string;
  includes: string[];
  highlight?: boolean;
};

export const cateringPackages: CateringPackage[] = [
  {
    id: "pkg-backyard",
    name: "Backyard",
    guests: "10 – 25 guests",
    pricePerPerson: "$18",
    includes: ["Two smoked meats", "Two Southern sides", "Cornbread", "Sauces & utensils"],
  },
  {
    id: "pkg-celebration",
    name: "Celebration",
    guests: "25 – 75 guests",
    pricePerPerson: "$24",
    includes: ["Three smoked meats", "Three Southern sides", "Cornbread & rolls", "Sweet tea service", "Chafing setup"],
    highlight: true,
  },
  {
    id: "pkg-signature",
    name: "Signature Event",
    guests: "75+ guests",
    pricePerPerson: "Custom",
    includes: ["Four+ smoked meats", "Full side spread", "Dessert table", "On-site pitmaster", "Full-service staff"],
  },
];
