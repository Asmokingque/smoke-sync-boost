import { describe, expect, it } from "vitest";
import { calculateEstimatedOrderSummary } from "@/lib/ordering";

describe("checkout math", () => {
  it("applies tax after discounts", () => {
    const summary = calculateEstimatedOrderSummary({ subtotal: 100, discount: 10, tip: 15 });
    expect(summary.tax).toBe(7.43);
    expect(summary.total).toBe(112.43);
  });
});
