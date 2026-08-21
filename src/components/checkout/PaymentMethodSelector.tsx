import type { CheckoutPaymentMethod } from "@/components/checkout/types";

type PaymentMethodSelectorProps = {
  value: CheckoutPaymentMethod;
  onChange: (value: CheckoutPaymentMethod) => void;
};

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div>
        <div className="font-serif text-2xl text-foreground">Payment Method</div>
        <p className="text-sm text-muted-foreground">
          Your order will not be marked paid until Anderson's Smoking Que confirms payment.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { value: "pay_at_pickup" as const, label: "Pay at Pickup" },
          { value: "cash" as const, label: "Cash" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-4 py-4 text-left ${value === option.value ? "border-gold bg-background/80" : "border-border bg-background/40 hover:border-gold/30"}`}
          >
            <div className="font-stencil text-xs uppercase tracking-[0.2em]">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
