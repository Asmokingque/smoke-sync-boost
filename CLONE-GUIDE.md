# Cloning Anderson's Smoking Que — Step-by-Step

A complete, repeatable process to reproduce this website 100% (code, visuals, content, backend).

---

## 0. What makes up the site

| Layer | Where it lives |
| --- | --- |
| Visual tokens (colors, shadows, gradients, custom classes) | `src/index.css` |
| Fonts, container, animations | `tailwind.config.ts` |
| Reusable class tokens (buttons, spacing, cards, text) | `src/data/theme.ts` |
| Editable copy / homepage content | `src/data/siteContent.ts`, `src/data/homepageLayout.ts`, `src/data/serviceAreaData.ts` |
| Fallback menu | `src/data/menuData.ts` |
| Pages & routes | `src/pages/`, `src/App.tsx` |
| Sections & components | `src/components/` |
| Backend (DB, auth, functions) | `supabase/` + Lovable Cloud |
| Live CMS overrides | `content_overrides` table (merged over `src/data/*`) |

---

## 1. Export the source

```bash
npm run export:zip
```
Produces `asmokingque-website.zip` (source only — no `node_modules`, no secrets).

## 2. Export the visual details

```bash
npm run export:design
```
Produces:
- `design-system.json` — every CSS variable resolved to HSL **and hex**, gradients, shadows, radii, font stacks, container settings, animations, and every custom utility class.
- `DESIGN-SYSTEM.md` — the same data as a readable spec sheet.

Use these two files to rebuild the look anywhere, even outside React.

## 3. Recreate the project shell

```bash
unzip asmokingque-website.zip -d asq-clone
cd asq-clone
npm ci          # exact dependency versions from package-lock.json
```

Keep these files byte-identical for a pixel-perfect clone:
`src/index.css`, `tailwind.config.ts`, `src/data/theme.ts`, `index.html`, `postcss.config.js`, `components.json`.

## 4. Recreate the backend

1. Create a new Supabase/Lovable Cloud project.
2. Apply migrations in `supabase/migrations/` in filename order.
3. Deploy every function folder under `supabase/functions/`.
4. Set the secrets the functions need (Stripe, email, etc.) — they are intentionally **not** in the export.
5. Create the storage buckets (`menu-images`, etc.) and copy objects across.
6. Create an admin row in `admin_users` linked to a real auth user.

## 5. Recreate the content

- Copy the `content_overrides` table rows, **or**
- Sign into `/admin/content` in the clone and click **Download .ts** on the original to paste defaults into `src/data/*.ts`.
- Copy `menu_categories`, `menu_items`, `specials`, `business_settings`, and `holiday_events` rows.

## 6. Point the clone at the new backend

Set in `.env`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

## 7. Run and verify

```bash
npm run dev      # http://localhost:8080
npm run lint
npm run build
npm run test
```

Visual checklist against the original:
- [ ] Dark charcoal background, crimson primary, gold hairline accents
- [ ] Cormorant Garamond headings, Inter body, Oswald uppercase labels
- [ ] Homepage section order matches `homepageLayout`
- [ ] Header, floating cart button, cart drawer, mobile "Order Now" bar
- [ ] Menu grid images and dual pricing
- [ ] Footer, service area, catering and checkout pages
- [ ] `/admin` redirects to `/admin/login` when signed out

## 8. Pixel-diff the clone (optional but recommended)

Screenshot both sites at the same viewport and compare:

```bash
npx playwright screenshot --viewport-size=1280,1800 https://asmokingque.com /tmp/original.png
npx playwright screenshot --viewport-size=1280,1800 http://localhost:8080 /tmp/clone.png
```
Repeat for `/menu`, `/catering`, `/specials`, `/contact`, `/checkout`.

---

## Rules that keep a clone faithful

- Never hardcode colors in components — always semantic tokens (`bg-primary`, `text-gold`).
- The 12-color brand palette in `src/index.css` is locked.
- Gold is for thin accents only (dividers, badges, borders) — never primary fills.
- Dark theme only.
