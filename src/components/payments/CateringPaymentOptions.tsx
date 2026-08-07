/**
 * CateringPaymentOptions.tsx
 * Future-ready catering payment choices (deposit, final balance, invoice, quote).
 */
import { CheckoutPaymentSelector } from "./CheckoutPaymentSelector";
import type { PaymentMethod } from "@/lib/paymentConnectors";

export function CateringPaymentOptions({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Catering orders may require a deposit up front with the balance due before the event.
      </p>
      <CheckoutPaymentSelector value={value} onChange={onChange} category="catering" />
    </div>
  );
}
