# Checkout monitoring fixes
- [x] Switch Promo Images from Hugging Face to Lovable AI; deployed, generated a completed test image, and passed three streaming/error tests.
- [ ] Verify generation and save through the signed-in admin page: requesting user has no matching account for session minting; requires admin sign-in in preview.
- [x] Create unpaid cash/pay-later orders without Stripe; verified guest pickup, guest delivery, and signed-in pickup confirmation with stored ownership.
- [x] Validate promo codes server-side and match discounted checkout totals; 34 regression tests pass.
- [x] Resolve cash/pay-later finding after preview and stored-order verification.
- [ ] Verify discounted Stripe checkout and resolve promo finding: blocked by Stripe credential-not-found response, persisting after one project-key refresh. An accessible Stripe connection is required.