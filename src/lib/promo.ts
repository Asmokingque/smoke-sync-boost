export type Promo = {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
};

export type CartLine = { price: number; quantity: number };

export type LineAllocation = {
  lineTotal: number;
  lineDiscount: number;
  lineAfter: number;
};

export type DiscountBreakdown = {
  sub: number;
  discountAmount: number;
  discountedSub: number;
  lines: LineAllocation[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute the per-line discount allocation along with the totals.
 *
 * Invariants (enforced + asserted by callers/tests):
 *  - sum(lines.lineDiscount) === discountAmount (within rounding)
 *  - every lineDiscount is in [0, lineTotal]
 *  - every lineAfter is >= 0
 *  - discountAmount in [0, sub]
 *  - discountedSub = sub - discountAmount, >= 0
 *
 * For "fixed" promos the remainder from per-line proportional allocation is
 * assigned to the final line so the sum exactly matches discountAmount.
 */
export function computeDiscount(items: CartLine[], promo: Promo | null): DiscountBreakdown {
  const lineTotals = items.map((i) => Math.max(0, i.price * i.quantity));
  const sub = lineTotals.reduce((s, n) => s + n, 0);

  if (!promo || sub <= 0) {
    return {
      sub,
      discountAmount: 0,
      discountedSub: sub,
      lines: lineTotals.map((lt) => ({ lineTotal: lt, lineDiscount: 0, lineAfter: lt })),
    };
  }

  const rate =
    promo.type === "percent" ? Math.min(Math.max(promo.value, 0), 1) : 0;
  const fixed =
    promo.type === "fixed" ? Math.min(Math.max(promo.value, 0), sub) : 0;
  const rawDiscount = promo.type === "percent" ? sub * rate : fixed;
  const discountAmount = round2(Math.min(Math.max(rawDiscount, 0), sub));

  // Per-line proportional allocation, rounded to cents.
  const lines: LineAllocation[] = lineTotals.map((lt) => {
    const raw =
      promo.type === "percent" ? lt * rate : sub > 0 ? (lt / sub) * fixed : 0;
    const lineDiscount = Math.min(Math.max(round2(raw), 0), lt);
    return { lineTotal: lt, lineDiscount, lineAfter: round2(lt - lineDiscount) };
  });

  // Fix rounding drift so the sum matches discountAmount exactly.
  const summed = round2(lines.reduce((s, l) => s + l.lineDiscount, 0));
  const drift = round2(discountAmount - summed);
  if (drift !== 0 && lines.length > 0) {
    // Find a line that can absorb the drift without going negative or above its lineTotal.
    for (let idx = lines.length - 1; idx >= 0; idx--) {
      const l = lines[idx];
      const candidate = round2(l.lineDiscount + drift);
      if (candidate >= 0 && candidate <= l.lineTotal) {
        l.lineDiscount = candidate;
        l.lineAfter = round2(l.lineTotal - candidate);
        break;
      }
    }
  }

  return {
    sub: round2(sub),
    discountAmount,
    discountedSub: round2(Math.max(0, sub - discountAmount)),
    lines,
  };
}

/**
 * Final pre-submit guard: recompute totals from authoritative item data and
 * validate every value is finite, non-negative, and internally consistent.
 * Returns sanitized totals if valid, or an error message describing the violation.
 */
export type OrderTotals = {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  tax: number;
  total: number;
  lines: LineAllocation[];
};

export function buildSafeOrderTotals(
  items: CartLine[],
  promo: Promo | null,
  taxRate: number
): { ok: true; totals: OrderTotals } | { ok: false; error: string } {
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) {
    return { ok: false, error: "Invalid tax rate" };
  }
  for (const i of items) {
    if (!Number.isFinite(i.price) || !Number.isFinite(i.quantity)) {
      return { ok: false, error: "Invalid item price or quantity" };
    }
    if (i.price < 0 || i.quantity < 0 || !Number.isInteger(i.quantity)) {
      return { ok: false, error: "Item price and quantity must be non-negative" };
    }
  }

  const breakdown = computeDiscount(items, promo);
  const round2n = (n: number) => Math.round(n * 100) / 100;

  const subtotal = breakdown.sub;
  const discount = breakdown.discountAmount;
  const discountedSubtotal = breakdown.discountedSub;
  const tax = round2n(Math.max(0, discountedSubtotal * taxRate));
  const total = round2n(Math.max(0, discountedSubtotal + tax));

  // Hard invariants — any failure means we refuse to submit.
  const checks: [boolean, string][] = [
    [Number.isFinite(subtotal) && subtotal >= 0, "Subtotal must be a non-negative number"],
    [Number.isFinite(discount) && discount >= 0, "Discount must be a non-negative number"],
    [discount <= subtotal + 0.001, "Discount cannot exceed subtotal"],
    [Number.isFinite(discountedSubtotal) && discountedSubtotal >= 0, "Discounted subtotal must be non-negative"],
    [Number.isFinite(tax) && tax >= 0, "Tax must be non-negative"],
    [Number.isFinite(total) && total >= 0, "Total must be non-negative"],
    [total + 0.001 >= discountedSubtotal, "Total cannot be less than discounted subtotal"],
  ];
  for (const [ok, msg] of checks) {
    if (!ok) return { ok: false, error: msg };
  }

  // Re-verify per-line allocation invariants too.
  const summed = round2n(breakdown.lines.reduce((s, l) => s + l.lineDiscount, 0));
  if (Math.abs(summed - discount) > 0.02) {
    return { ok: false, error: "Line discount allocation does not match total discount" };
  }
  for (const l of breakdown.lines) {
    if (l.lineDiscount < 0 || l.lineAfter < 0 || l.lineDiscount > l.lineTotal + 0.001) {
      return { ok: false, error: "Invalid per-line discount allocation" };
    }
  }

  return {
    ok: true,
    totals: {
      subtotal: round2n(subtotal),
      discount: round2n(discount),
      discountedSubtotal: round2n(discountedSubtotal),
      tax,
      total,
      lines: breakdown.lines,
    },
  };
}
