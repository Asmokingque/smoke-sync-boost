import { describe, expect, it } from "vitest";
import { calculateEstimatedOrderSummary, clampCartQuantity } from "@/lib/ordering";

describe("cart helpers", () => {
  it("clamps quantity within supported limits", () => {
    expect(clampCartQuantity(0)).toBe(1);
    expect(clampCartQuantity(25)).toBe(20);
    expect(clampCartQuantity(3)).toBe(3);
  });

  it("calculates estimated totals", () => {
    expect(
      calculateEstimatedOrderSummary({ subtotal: 20, serviceFee: 2, deliveryFee: 6.99, discount: 1, tip: 3 }),
    ).toMatchObject({
      subtotal: 20,
      serviceFee: 2,
      deliveryFee: 6.99,
      discount: 1,
      tip: 3,
    });
  });
});
