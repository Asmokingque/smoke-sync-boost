/**
 * theme.ts
 * ---------------------------------------------------------------------------
 * Design tokens in one place. Colors themselves are defined as CSS variables
 * in src/index.css (the locked brand palette). This file maps them to
 * friendly names plus reusable class strings so components don't repeat
 * design code.
 *
 * To change a COLOR VALUE  -> edit src/index.css (--bbq-* variables)
 * To change SPACING/RADIUS -> edit this file
 * ---------------------------------------------------------------------------
 */

export const theme = {
  /** Semantic color token names (use as Tailwind classes, e.g. text-gold) */
  colors: {
    background: "bg-background",
    surface: "bg-card",
    primary: "text-primary",
    primaryFill: "bg-primary",
    gold: "text-gold",
    muted: "text-muted-foreground",
    foreground: "text-foreground",
  },

  /** Font roles — see tailwind.config.ts for the family definitions */
  fonts: {
    heading: "font-serif", // Cormorant Garamond
    body: "font-sans", // Inter
    stencil: "font-stencil", // Oswald — small uppercase labels only
  },

  /** Button styles (defined in src/index.css) */
  buttons: {
    primary:
      "luxury-primary-btn h-14 px-8 font-stencil text-sm tracking-widest inline-flex items-center justify-center gap-2",
    secondary:
      "luxury-secondary-btn h-14 px-8 font-stencil text-sm tracking-widest inline-flex items-center justify-center gap-2",
    small:
      "luxury-secondary-btn h-11 px-6 font-stencil text-xs tracking-widest inline-flex items-center justify-center gap-2",
  },

  /** Vertical rhythm between page sections */
  spacing: {
    section: "py-20 md:py-28",
    sectionTight: "py-14 md:py-20",
    sectionLoose: "py-28 md:py-36",
    container: "container",
  },

  /** Corner rounding */
  radius: {
    card: "rounded-xl",
    button: "rounded-md",
    pill: "rounded-full",
  },

  /** Card presets */
  cards: {
    base: "luxury-card p-8",
    compact: "luxury-card p-5",
    hoverLift: "hover:-translate-y-1 transition-transform",
  },

  /** Shared type styles */
  text: {
    eyebrow: "luxury-eyebrow",
    badge: "luxury-badge",
    sectionTitle: "luxury-menu-title text-4xl md:text-5xl",
    heroTitle: "luxury-hero-title",
    subtitle: "luxury-subtitle",
    goldLine: "luxury-gold-line",
    divider: "luxury-divider",
    price: "luxury-price",
  },
} as const;

export type Theme = typeof theme;
