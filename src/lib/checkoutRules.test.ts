import { describe, it, expect } from "vitest";
import { checkoutTotals, promoDiscountCents, manualPaymentState } from "../../supabase/functions/_shared/checkoutRules";

describe("checkout payment rules", () => {
  it("cash delivery stays unpaid without a card session", () => {
    expect(manualPaymentState("manual_cash", "Delivery")).toEqual({ status: "pending", payment_status: "unpaid" });
  });
  it("pay at pickup stays unpaid", () => {
    expect(manualPaymentState("pay_at_pickup", "Pickup").payment_status).toBe("unpaid");
  });
  it("rejects pay at pickup for delivery", () => {
    expect(() => manualPaymentState("pay_at_pickup", "Delivery")).toThrow("only available for pickup");
  });
  it("SMOKE10 reduces the charge by 10 percent before tax", () => {
    expect(checkoutTotals(10000, "SMOKE10", 0, "Pickup")).toEqual({
      promoCents: 1000, discountCents: 1000, taxCents: 743, deliveryFeeCents: 0, totalCents: 9743,
    });
  });
  it("BBQ20 reduces the subtotal by 20 percent", () => {
    expect(promoDiscountCents(10000, "BBQ20")).toBe(2000);
  });
  it("PITMASTER5 removes five dollars", () => {
    expect(promoDiscountCents(1899, "PITMASTER5")).toBe(500);
  });
  it("rejects unknown promo codes", () => {
    expect(() => promoDiscountCents(10000, "FAKE100")).toThrow("Invalid promo code");
  });
  it("uses discounted subtotal for the free delivery threshold", () => {
    expect(checkoutTotals(8000, "SMOKE10", 0, "Delivery")).toEqual({
      promoCents: 800, discountCents: 800, taxCents: 594, deliveryFeeCents: 699, totalCents: 8493,
    });
  });
  it("keeps delivery free at seventy-five dollars", () => {
    expect(checkoutTotals(7500, undefined, 0, "Delivery").deliveryFeeCents).toBe(0);
  });
  it("stacks community discounts after promos", () => {
    expect(checkoutTotals(10000, "SMOKE10", 900, "Pickup").totalCents).toBe(8768);
  });
});