# Anderson's Smoking Que — Website

Premium Southern smokehouse website with an online menu, cart, Stripe checkout,
specials, catering requests, guest reviews and an admin dashboard.

**Stack:** React 18 + Vite 5 + TypeScript + Tailwind CSS v3 + shadcn/ui,
with Supabase (Lovable Cloud) for database, auth, storage and edge functions.

---

## 1. Anderson's Smoking Que Website Overview

This project is the public website for **Anderson's Smoking Que**, a premium
Southern smokehouse. It includes:

- A branded homepage with editable sections
- A full online menu with categories, photos, prices and search
- A shopping cart with delivery/pickup options
- Stripe checkout for online orders
- Admin dashboard for menu, specials, catering requests and orders
- Email receipts and admin notifications
- SEO optimization with structured data and sitemaps

The site is designed to be fully editable outside of Lovable through modular
data files and components.

---

## 2. How to Run Locally

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

## 3. How to Export from Lovable

You can export the full codebase from Lovable at any time:

1. In Lovable, open the project.
2. Go to **Settings → Git** or use the **Export** option.
3. Connect to GitHub to create a synced repository, or download the project as a ZIP.

Once exported, all files in this structure remain editable:

- `src/data/` — all editable content
- `src/components/home/` — homepage sections
- `src/components/menu/` — menu layout
- `src/components/cart/` — cart and checkout
- `src/pages/admin/` — admin dashboard

The site will still work locally using fallback data if Supabase is not connected.

---

## 4. How to Edit Homepage Sections

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

Global homepage text lives in `src/data/siteContent.ts`.

---

## 5. How to Edit Menu Items

- **Live menu (what customers see in production):** edited in the Admin
dashboard at `/admin/menu`, stored in the database.
- **Fallback / local development menu:** `src/data/menuData.ts`.

Loading logic lives in `src/hooks/useMenuData.ts`:

1. Try the database.
2. If it's not connected, errors, or returns no rows → use `menuData.ts`.
3. Admin edits stream in live via realtime.

Menu layout and presentation components live in `src/components/menu/` and
`src/components/retina/`.

---

## 6. How to Edit Specials

- Copy and fallbacks: `src/data/specialsData.ts`
- Live specials: Admin dashboard → `/admin/specials`
- Holiday copy and fallbacks: `src/data/holidayData.ts`

Special cards and display logic live in `src/components/specials/`.

---

## 7. How to Edit Service Area Text

`src/data/serviceAreaData.ts` — city list, delivery fee cards, footnote.

Current default wording:

> "Serving Lake City and surrounding areas."

Change the `cities`, `details`, and `footnote` values in that file to update
the "Where We Serve" section on the homepage.

---

## 8. How to Edit Colors and Theme

- **Color values:** `src/index.css` (the locked `--bbq-*` brand palette) and
`tailwind.config.ts`.
- **Reusable style tokens:** `src/data/theme.ts` (button classes, section
spacing, radius, card presets, type styles).
- **Shared UI building blocks:** `src/components/shared/`
(`SectionHeader`, `PremiumCard`, `PremiumButton`, `SmokeDivider`,
`StatusBadge`). Use these instead of repeating classes.

> Always use semantic tokens (`text-gold`, `bg-primary`, `text-foreground`).
> Never hardcode hex values or `text-white` / `bg-black` in components.

---

## 9. How Supabase Is Used

Supabase (via Lovable Cloud) powers the backend:

- **Database:** menu items, categories, specials, orders, catering requests,
reviews, and admin data
- **Auth:** admin login and protected dashboard routes
- **Storage:** menu item photos and other uploaded assets
- **Edge Functions:** checkout sessions, payment webhooks, email sending,
health checks

Client import:

```ts
import { supabase } from "@/integrations/supabase/client";
```

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

---

## 10. How Stripe Checkout Is Used

Stripe Embedded Checkout is used for online orders:

- Checkout session creation: `supabase/functions/create-checkout-session/`
- Payment webhook (marks orders paid, triggers receipts):
`supabase/functions/payments-webhook/`
- Client-side embedded checkout: `src/components/checkout/StripeEmbeddedCheckout.tsx`
and `src/lib/stripe.ts`
- Publishable key: `VITE_PAYMENTS_CLIENT_TOKEN` in `.env`
- Secret key: stored as a backend secret (`STRIPE_SECRET_KEY`), never in code

The checkout flow:

1. Customer adds items to cart and chooses delivery or pickup.
2. On checkout, the app sends the cart and order type to the Edge Function.
3. The Edge Function creates a Stripe Checkout session and returns a
`clientSecret`.
4. The embedded Stripe form is displayed inline for the customer to pay.
5. After payment, Stripe redirects to the return page and the webhook marks
the order as paid.
6. Email receipts and admin notifications are sent automatically.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

---

## 11. How to Deploy

**From Lovable:** click Publish. Custom domains are managed in project settings.

**Anywhere else (Vercel / Netlify / Cloudflare Pages):**

1. Push the exported repo to GitHub.
2. Import it in your host.
3. Build command: `npm run build` — output directory: `dist`.
4. Add the `VITE_*` environment variables.
5. Deploy. Edge functions continue running on Supabase and need no change.

---

## Editing Quick Reference

| What to change | Where to edit |
| --- | --- |
| Business name, hero text, footer, CTAs | `src/data/siteContent.ts` |
| Fallback menu items | `src/data/menuData.ts` |
| Colors and theme tokens | `src/data/theme.ts` and `src/index.css` |
| Homepage sections | `src/components/home/` |
| Menu layout | `src/components/menu/` and `src/components/retina/` |
| Cart and checkout | `src/components/cart/` and `src/components/checkout/` |
| Admin dashboard | `src/pages/admin/` |

---

## Editing Conventions

- One component = one job. Keep files small.
- Put text in `src/data/`, not inside JSX, whenever practical.
- Reuse `shared/` components rather than copying class strings.
- Every major component has a comment header explaining what it controls.
