/**
 * siteContent.ts
 * ---------------------------------------------------------------------------
 * Edit this file to change the homepage text.
 *
 * ALL global website copy lives here (business info, hero text, footer, CTAs).
 * Edit the strings below to change wording across the site. No JSX required.
 * ---------------------------------------------------------------------------
 */

export const siteContent = {
  /** Business identity */
  businessName: "Anderson's Smoking Que",
  tagline: "Smoked Low. Served Bold.",
  email: "Support@Asmokingque.com",
  phone: "",

  /** Homepage hero section (src/components/home/HeroSection.tsx) */
  heroEyebrow: "Premium Southern Smokehouse",
  heroTitle: "Anderson's",
  heroTitleAccent: "Smoking Que",
  heroSubtitle: "Smoked Low. Served Bold.",
  heroDescription:
    "Slow-smoked meats, Southern dinners, handcrafted sides, and catering prepared with bold flavor, patience, and hometown pride.",

  /** Hero "signature favorite" card (right side of the homepage hero) */
  heroFeatured: {
    badge: "Signature Favorite",
    price: "$15",
    title: "Two or Three Meat Plate",
    description:
      "Your choice of slow-smoked meats with classic Southern sides and house cornbread.",
  },

  /** Short blurb used near the service-area map/section */
  serviceAreaText: "Serving Lake City and surrounding areas.",



  /** Footer */
  footerText:
    "Authentic Southern smokehouse — slow-smoked brisket, ribs, pulled pork, wings and sides.",
  footerLegal: `© ${new Date().getFullYear()} Anderson's Smoking Que. All rights reserved.`,

  /** Social links — leave a value empty to hide that link */
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },

  /** Button / call-to-action labels used across the site */
  callToAction: {
    startOrder: "Start Order",
    viewMenu: "View Menu",
    viewFullMenu: "View Full Menu",
    requestCatering: "Request Catering",
    addToOrder: "Add to Order",
    viewAllSpecials: "View All Specials",
    fullHolidayCalendar: "Full Holiday Calendar",
    leaveReview: "Share Your Experience",
    checkout: "Secure Checkout",
  },
} as const;

export type SiteContent = typeof siteContent;
