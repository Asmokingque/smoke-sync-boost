import { calculateEstimatedOrderSummary, TAX_RATE } from "@/lib/ordering";

export type CartSummaryProps = {
  subtotal: number;
  taxRate?: number;
  serviceFee?: number;
  deliveryFee?: number;
  discount?: number;
  tip?: number;
  totalOverride?: number;
  className?: string;
};

export function CartSummary({
  subtotal,
  taxRate = TAX_RATE,
  serviceFee = 0,
  deliveryFee = 0,
  discount = 0,
  tip = 0,
  totalOverride,
  className,
}: CartSummaryProps) {
  const summary = calculateEstimatedOrderSummary({
    subtotal,
    taxRate,
    serviceFee,
    deliveryFee,
    discount,
    tip,
  });

  const total = totalOverride ?? summary.total;

  return (
    <div className={className}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Subtotal</span>
          <span>${summary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Tax ({(taxRate * 100).toFixed(2)}%)</span>
          <span>${summary.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Service Fee</span>
          <span>${summary.serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery Fee</span>
          <span>${summary.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span>
          <span>- ${summary.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tip</span>
          <span>${summary.tip.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gold/20" />
        <div className="flex justify-between text-xl font-black text-foreground">
          <span>Estimated Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Totals are estimated. Final total will be calculated and confirmed server-side.
      </p>
    </div>
  );
}
