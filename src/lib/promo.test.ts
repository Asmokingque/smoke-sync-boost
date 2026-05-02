import { describe, it, expect } from "vitest";
import { computeDiscount, type Promo, type CartLine } from "./promo";

const round2 = (n: number) => Math.round(n * 100) / 100;

const SMOKE10: Promo = { code: "SMOKE10", label: "10% off", type: "percent", value: 0.1 };
const PITMASTER5: Promo = { code: "PITMASTER5", label: "$5 off", type: "fixed", value: 5 };
const HUGE: Promo = { code: "HUGE", label: "$999 off", type: "fixed", value: 999 };

const cases: { name: string; items: CartLine[]; promo: Promo | null }[] = [
  { name: "no promo", items: [{ price: 12.5, quantity: 2 }], promo: null },
  { name: "percent on single line", items: [{ price: 19.99, quantity: 1 }], promo: SMOKE10 },
  {
    name: "fixed split across uneven lines",
    items: [
      { price: 7.33, quantity: 1 },
      { price: 11.49, quantity: 3 },
      { price: 4.25, quantity: 2 },
    ],
    promo: PITMASTER5,
  },
  {
    name: "fixed larger than subtotal is clamped",
    items: [{ price: 3, quantity: 1 }, { price: 1.5, quantity: 1 }],
    promo: HUGE,
  },
  { name: "empty cart", items: [], promo: PITMASTER5 },
];

describe("computeDiscount invariants", () => {
  for (const c of cases) {
    it(`[${c.name}] line discounts sum to discountAmount`, () => {
      const r = computeDiscount(c.items, c.promo);
      const summed = round2(r.lines.reduce((s, l) => s + l.lineDiscount, 0));
      expect(summed).toBe(round2(r.discountAmount));
    });

    it(`[${c.name}] no negative line totals or discounts`, () => {
      const r = computeDiscount(c.items, c.promo);
      for (const l of r.lines) {
        expect(l.lineDiscount).toBeGreaterThanOrEqual(0);
        expect(l.lineDiscount).toBeLessThanOrEqual(l.lineTotal);
        expect(l.lineAfter).toBeGreaterThanOrEqual(0);
        expect(round2(l.lineAfter + l.lineDiscount)).toBe(round2(l.lineTotal));
      }
    });

    it(`[${c.name}] discount and subtotal are bounded`, () => {
      const r = computeDiscount(c.items, c.promo);
      expect(r.discountAmount).toBeGreaterThanOrEqual(0);
      expect(r.discountAmount).toBeLessThanOrEqual(r.sub);
      expect(r.discountedSub).toBeGreaterThanOrEqual(0);
      expect(round2(r.discountedSub + r.discountAmount)).toBe(round2(r.sub));
    });
  }

  it("fixed promo larger than subtotal clamps to subtotal", () => {
    const r = computeDiscount([{ price: 3, quantity: 1 }], HUGE);
    expect(r.discountAmount).toBe(3);
    expect(r.discountedSub).toBe(0);
  });

  it("rounding drift on fixed allocation is reconciled", () => {
    // Three equal lines + $5 promo => 5/3 each = 1.6667, rounded gives drift.
    const r = computeDiscount(
      [
        { price: 10, quantity: 1 },
        { price: 10, quantity: 1 },
        { price: 10, quantity: 1 },
      ],
      PITMASTER5
    );
    const summed = round2(r.lines.reduce((s, l) => s + l.lineDiscount, 0));
    expect(summed).toBe(5);
  });
});

import { buildSafeOrderTotals } from "./promo";

describe("buildSafeOrderTotals guard", () => {
  it("accepts a normal order and returns sanitized totals", () => {
    const r = buildSafeOrderTotals(
      [{ price: 10, quantity: 2 }, { price: 5.5, quantity: 1 }],
      PITMASTER5,
      0.07
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.totals.subtotal).toBe(25.5);
      expect(r.totals.discount).toBe(5);
      expect(r.totals.discountedSubtotal).toBe(20.5);
      expect(r.totals.tax).toBeGreaterThanOrEqual(0);
      expect(r.totals.total).toBeGreaterThanOrEqual(r.totals.discountedSubtotal);
    }
  });

  it("rejects negative item price", () => {
    const r = buildSafeOrderTotals([{ price: -1, quantity: 1 }], null, 0.07);
    expect(r.ok).toBe(false);
  });

  it("rejects non-integer quantity", () => {
    const r = buildSafeOrderTotals([{ price: 5, quantity: 1.5 }], null, 0.07);
    expect(r.ok).toBe(false);
  });

  it("rejects negative tax rate", () => {
    const r = buildSafeOrderTotals([{ price: 5, quantity: 1 }], null, -0.1);
    expect(r.ok).toBe(false);
  });

  it("rejects NaN/Infinity inputs", () => {
    expect(buildSafeOrderTotals([{ price: NaN, quantity: 1 }], null, 0.07).ok).toBe(false);
    expect(buildSafeOrderTotals([{ price: Infinity, quantity: 1 }], null, 0.07).ok).toBe(false);
  });

  it("never produces negative totals even with huge fixed promo", () => {
    const r = buildSafeOrderTotals([{ price: 4, quantity: 1 }], HUGE, 0.07);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.totals.discount).toBeLessThanOrEqual(r.totals.subtotal);
      expect(r.totals.discountedSubtotal).toBeGreaterThanOrEqual(0);
      expect(r.totals.tax).toBeGreaterThanOrEqual(0);
      expect(r.totals.total).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles empty cart safely", () => {
    const r = buildSafeOrderTotals([], PITMASTER5, 0.07);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.totals.subtotal).toBe(0);
      expect(r.totals.discount).toBe(0);
      expect(r.totals.total).toBe(0);
    }
  });
});
