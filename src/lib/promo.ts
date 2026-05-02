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
