# Anderson's Smoking Que — Website

Premium Southern smokehouse website with an online menu, cart, Stripe checkout,
specials, catering requests, guest reviews and an admin dashboard.

**Stack:** React 18 + Vite 5 + TypeScript + Tailwind CSS v3 + shadcn/ui,
with Supabase (Lovable Cloud) for database, auth, storage and edge functions.

---

## Run it locally

```bash
npm install
npm run dev
```

The site runs at `http://localhost:8080`.

Other scripts:

```bash
npm run build      # production build into /dist
npm run preview    # preview the production build
```

---

## Where to edit things

### 1. Global text (business name, hero copy, footer, buttons)

`src/data/siteContent.ts`

Contains `businessName`, `tagline`, `email`, `heroTitle`, `heroSubtitle`,
`heroDescription`, `serviceAreaText`, `footerText`, `socialLinks` and all
`callToAction` button labels.

### 2. Homepage sections

`src/pages/Home.tsx` is only a list of sections. Reorder, remove or add lines:

```tsx
<HeroSection />
<FeaturedSpecialSection />
<SignatureFavoritesSection />
<ServiceAreaSection />
<LunchSpecialsSection />
<UpcomingHolidaysSection />
<CommunityHeroesSection />
<CateringPreviewSection />
<ExperiencePreviewSection />
```

Each file lives in `src/components/home/` and controls exactly one band of the
homepage:

| Section file | Controls |
| --- | --- |
| `HeroSection.tsx` | Hero photo, headline, tagline, main buttons |
| `FeaturedSpecialSection.tsx` | Today's special + quick-link tiles |
| `SignatureFavoritesSection.tsx` | Trust badges + Pitmaster Picks |
| `ServiceAreaSection.tsx` | Cities served, delivery fees |
| `LunchSpecialsSection.tsx` | Mon–Fri lunch deals |
| `UpcomingHolidaysSection.tsx` | Next 3 holidays |
| `CommunityHeroesSection.tsx` | Military / first responder / teacher discount |
| `CateringPreviewSection.tsx` | Catering call-to-action |
| `ExperiencePreviewSection.tsx` | Guest review teaser |

### 3. Menu items

- **Live menu (what customers see in production):** edited in the Admin
  dashboard at `/admin/menu`, stored in the database.
- **Fallback / local development menu:** `src/data/menuData.ts`.

Loading logic lives in `src/hooks/useMenuData.ts`:

1. Try the database.
2. If it's not connected, errors, or returns no rows → use `menuData.ts`.
3. Admin edits stream in live via realtime.

### 4. Colors, fonts, spacing, buttons, cards

- **Color values:** `src/index.css` (the locked `--bbq-*` brand palette) and
  `tailwind.config.ts`.
- **Reusable style tokens:** `src/data/theme.ts` (button classes, section
  spacing, radius, card presets, type styles).
- **Shared UI building blocks:** `src/components/shared/`
  (`SectionHeader`, `PremiumCard`, `PremiumButton`, `SmokeDivider`,
  `StatusBadge`). Use these instead of repeating classes.

> Always use semantic tokens (`text-gold`, `bg-primary`, `text-foreground`).
> Never hardcode hex values or `text-white` / `bg-black` in components.

### 5. Service area text

`src/data/serviceAreaData.ts` — city list, delivery fee cards, footnote.

### 6. Specials

- Copy and fallbacks: `src/data/specialsData.ts`
- Live specials: Admin dashboard → `/admin/specials`
- Holiday copy and fallbacks: `src/data/holidayData.ts`

### 7. Catering

- Copy and package tiers: `src/data/cateringData.ts`
- Packages grid component: `src/components/catering/CateringPackages.tsx`
- Page: `src/pages/Catering.tsx`, inquiries land in `/admin/catering`

---

## Folder map

```
src/
  assets/                 images bundled with the app
  components/
    layout/               Header, Footer, SiteLayout
    home/                 one file per homepage section
    menu/                 menu-specific UI (options picker, callouts)
    retina/               menu cards, carousel, category bar, floating cart
    cart/                 cart drawer, cart controls, checkout buttons
    checkout/             Stripe embedded checkout, safety block
    specials/             special cards
    orders/               order status timeline
    seo/                  <Seo /> head-tag helper
    shared/               SectionHeader, PremiumCard, PremiumButton, StatusBadge
    ui/                   shadcn/ui primitives (rarely edited directly)
  data/                   EDITABLE CONTENT FILES (start here)
  hooks/                  data loading (useMenuData, useSpecials, useAuth, ...)
  lib/                    helpers (specials logic, promos, stripe, utils)
  pages/                  one file per route
    admin/                admin dashboard screens
  integrations/supabase/  auto-generated client + types (do not edit)
supabase/functions/       edge functions (checkout, webhooks, email, health)
```

---

## Connecting the backend (Supabase)

Environment variables live in `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

The client is created in `src/integrations/supabase/client.ts` (auto-generated —
don't edit it). If these variables are missing, the site still renders using the
fallback data files.

Server-side secrets (Stripe key, email keys, service role) are configured as
backend secrets, not in the repo.

## Connecting Stripe

- Checkout session creation: `supabase/functions/create-checkout-session/`
- Payment webhook (marks orders paid, triggers receipts):
  `supabase/functions/payments-webhook/`
- Client-side embedded checkout: `src/components/checkout/StripeEmbeddedCheckout.tsx`
  and `src/lib/stripe.ts`
- Publishable key: `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
- Secret key: stored as a backend secret (`STRIPE_SECRET_KEY`), never in code

Test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## Emails

Order receipts and admin notifications are sent from
`supabase/functions/send-order-emails/` using templates in
`supabase/functions/_shared/transactional-email-templates/`.

---

## Deployment

**From Lovable:** click Publish. Custom domains are managed in project settings.

**Anywhere else (Vercel / Netlify / Cloudflare Pages):**

1. Push the exported repo to GitHub.
2. Import it in your host.
3. Build command: `npm run build` — output directory: `dist`.
4. Add the `VITE_*` environment variables.
5. Deploy. Edge functions continue running on Supabase and need no change.

---

## Editing conventions

- One component = one job. Keep files small.
- Put text in `src/data/`, not inside JSX, whenever practical.
- Reuse `shared/` components rather than copying class strings.
- Every major component has a comment header explaining what it controls.
