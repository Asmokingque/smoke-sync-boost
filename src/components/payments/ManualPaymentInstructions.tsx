/**
 * ManualPaymentInstructions.tsx
 * Shows the instructions + "not paid until confirmed" warning for manual methods.
 */
import { Info } from "lucide-react";
import { MANUAL_PAYMENT_WARNING, type PaymentMethod } from "@/lib/paymentConnectors";

export function ManualPaymentInstructions({ method }: { method: PaymentMethod }) {
  return (
    <div className="rounded-md border border-gold/30 bg-gradient-to-r from-primary/5 via-gold/5 to-primary/5 p-4 text-sm flex gap-3">
      <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
      <div className="space-y-1">
        <strong className="text-gold font-stencil tracking-wider text-xs uppercase block">
          {method.label}
        </strong>
        {method.instructions && <p className="text-muted-foreground">{method.instructions}</p>}
        <p className="text-muted-foreground">{MANUAL_PAYMENT_WARNING}</p>
      </div>
    </div>
  );
}
