# BBQ Business Launch — Guidelines

## Components

The design system exports these components — import them from `@ws-tpnofyf7w9euqohcrhkq/8670264f-5376-4ce1-a599-daa2c984dcd4` and compose them before building anything from scratch:

`AccordionContent`, `AccordionItem`, `AccordionTrigger`, `Accordion`, `AdminAuthProvider`, `AdminFormCard`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogOverlay`, `AlertDialogPortal`, `AlertDialogTitle`, `AlertDialogTrigger`, `AlertDialog`, `AnimatedAddToCartButton`, `AnimatedCartControls`, `Badge`, `Button`, `CartDrawer`, `CartPulseBadge`, `CategoryJumpBar`, `CateringCallout`, `CateringPackages`, `CateringPreviewSection`, `CheckoutPaymentSelector`, `CommunityHeroesSection`, `ConfirmDeleteDialog`, `ConnectorAutoTestCard`, `Constants`, `ContentFieldEditor`, `ContentProvider`, `DevAdminSignIn`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger`, `Dialog`, `ExperiencePreviewSection`, `FeaturedMenuCarousel`, `FeaturedSpecialSection`, `FloatingCartButton`, `FlyingCartLayer`, `Footer`, `GlassSection`, `Header`, `HeroSection`, `ImageUploader`, `Input`, `Label`, `LunchSpecialsSection`, `ManualPaymentInstructions`, `OptionsPickerDialog`, `OrderStatusBadge`, `OrderStatusTimeline`, `PaymentConnectorSettingsModal`, `PaymentConnectorStatusBadge`, `PaymentMethodToggle`, `PaymentProviderCard`, `PaymentTestModeBanner`, `PaymentTestPanel`, `PremiumButton`, `PremiumCard`, `Progress`, `RequireSuperAdmin`, `RetinaMenuCard`, `ReviewPhotoCard`, `RoleBadge`, `SafetyCommitmentBlock`, `SectionHeader`, `SecureCheckoutButton`, `SecureCheckoutOverlay`, `Seo`, `ServiceAreaSection`, `SetPasswordDialog`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetFooter`, `SheetHeader`, `SheetOverlay`, `SheetPortal`, `SheetTitle`, `SheetTrigger`, `Sheet`, `ShimmerButton`, `SignatureFavoritesSection`, `SiteLayout`, `SmokeBackground`, `SmokeDivider`, `SopFunctionIndex`, `SpecialCard`, `StatCard`, `StatusBadge`, `StripeEmbeddedCheckout`, `Switch`, `Textarea`, `ToastAction`, `ToastClose`, `ToastDescription`, `ToastProvider`, `ToastTitle`, `ToastViewport`, `Toast`, `TopAlertBar`, `UpcomingHolidaysSection`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-tpnofyf7w9euqohcrhkq/8670264f-5376-4ce1-a599-daa2c984dcd4/data/theme` (source — preferred import)
- `@ws-tpnofyf7w9euqohcrhkq/8670264f-5376-4ce1-a599-daa2c984dcd4/index.css` (source — preferred import)
- `@ws-tpnofyf7w9euqohcrhkq/8670264f-5376-4ce1-a599-daa2c984dcd4/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

