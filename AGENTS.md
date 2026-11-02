# Project rules
- Load remote brand font stylesheets through document-head links, never CSS @import, so the stylesheet compiler does not resolve remote URLs as local files.
- Promo image generation uses the server-only Lovable AI image gateway and a shared SSE client parser; preserve admin authentication, forward upstream statuses, and never expose private keys to browsers.
- Keep checkout promo definitions and monetary rules in the pure shared checkout rules module used by frontend and order creation; this prevents displayed discounts drifting from charges.
- Use the existing server-repriced checkout endpoint for cash/pay-later orders, validating enabled methods and persisting unpaid state before skipping Stripe; never trust browser totals or payment state.