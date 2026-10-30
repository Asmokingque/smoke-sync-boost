export const CHECKOUT_PROMOS = [
  { code: "SMOKE10", label: "10% off", type: "percent" as const, value: 0.1 },
  { code: "BBQ20", label: "20% off", type: "percent" as const, value: 0.2 },
  { code: "PITMASTER5", label: "$5 off order", type: "fixed" as const, value: 5 },
];

export function promoDiscountCents(subtotalCents: number, code?: string) {
  if (!code) return 0;
  const promo = CHECKOUT_PROMOS.find((p) => p.code === code.trim().toUpperCase());
  if (!promo) throw new Error("Invalid promo code.");
  return Math.min(subtotalCents, Math.round(promo.type === "percent"
    ? subtotalCents * promo.value : promo.value * 100));
}

export function checkoutTotals(subtotalCents: number, promoCode: string | undefined,
  communityDiscountCents: number, orderType: "Pickup" | "Delivery", tipCents = 0) {
  const promoCents = promoDiscountCents(subtotalCents, promoCode);
  const discountCents = Math.min(subtotalCents, promoCents + communityDiscountCents);
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxableCents * 0.0825);
  const deliveryFeeCents = orderType === "Delivery" && taxableCents < 7500 ? 699 : 0;
  return { promoCents, discountCents, taxCents, deliveryFeeCents,
    totalCents: taxableCents + taxCents + deliveryFeeCents + tipCents };
}

export function manualPaymentState(methodKey: string, orderType: "Pickup" | "Delivery") {
  if (methodKey !== "pay_at_pickup" && methodKey !== "manual_cash") {
    throw new Error("Unsupported pay-later method.");
  }
  if (methodKey === "pay_at_pickup" && orderType !== "Pickup") {
    throw new Error("Pay at pickup is only available for pickup orders. Choose cash for delivery.");
  }
  return { status: "pending", payment_status: "unpaid" };
}