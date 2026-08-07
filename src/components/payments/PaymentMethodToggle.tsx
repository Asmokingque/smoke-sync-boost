/**
 * PaymentMethodToggle.tsx
 * One switch row for a single payment method inside a provider card.
 */
import { Switch } from "@/components/ui/switch";
import type { PaymentMethod } from "@/lib/paymentConnectors";

export function PaymentMethodToggle({
  method,
  disabled,
  onToggle,
}: {
  method: PaymentMethod;
  disabled?: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{method.label}</div>
        {method.description && (
          <p className="text-[11px] text-muted-foreground truncate">{method.description}</p>
        )}
      </div>
      <Switch checked={method.enabled} disabled={disabled} onCheckedChange={onToggle} />
    </div>
  );
}
