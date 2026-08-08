/**
 * CheckoutPaymentSelector.tsx
 * Renders only the payment methods whose connector AND method are enabled.
 */
import { ManualPaymentInstructions } from "./ManualPaymentInstructions";
import { usePaymentConnectors } from "@/hooks/usePaymentConnectors";
import type { PaymentMethod } from "@/lib/paymentConnectors";
import { Loader2 } from "lucide-react";

export function CheckoutPaymentSelector({
  value,
  onChange,
  category = "all",
}: {
  value: string | null;
  onChange: (method: PaymentMethod) => void;
  category?: "all" | "standard" | "manual" | "catering";
}) {
  const { checkoutMethods, loading } = usePaymentConnectors(true, true);
  const methods = checkoutMethods.filter(
    (m) => (category === "all" ? m.category !== "catering" : m.category === category),
  );
  const selected = methods.find((m) => m.method_key === value) ?? null;

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No payment methods are currently available. Please contact us to complete your order.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="luxury-eyebrow">Payment Method</span>
        <span className="luxury-gold-line flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((m) => {
          const active = m.method_key === value;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m)}
              className={[
                "rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-gold/70 bg-gradient-to-br from-primary/15 to-background/40 ring-gold-soft"
                  : "border-border/60 bg-background/40 hover:border-gold/40",
              ].join(" ")}
            >
              <div className={`font-stencil text-sm tracking-wider ${active ? "text-gold" : "text-foreground"}`}>
                {m.label}
              </div>
              {m.description && <div className="text-[11px] text-muted-foreground mt-1">{m.description}</div>}
            </button>
          );
        })}
      </div>

      {selected?.is_manual && <ManualPaymentInstructions method={selected} />}
    </div>
  );
}
