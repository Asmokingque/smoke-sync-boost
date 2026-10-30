# Checkout monitoring fixes
- [x] Create unpaid cash/pay-later orders without Stripe; verified guest pickup, guest delivery, and signed-in pickup confirmation with stored ownership.
- [x] Validate promo codes server-side and match discounted checkout totals; 34 regression tests pass.
- [x] Resolve cash/pay-later finding after preview and stored-order verification.
- [ ] Verify discounted Stripe checkout and resolve promo finding: blocked by Stripe credential-not-found response, persisting after one project-key refresh. An accessible Stripe connection is required.