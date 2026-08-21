import { MapPin, Store } from "lucide-react";
import type { CheckoutOrderType } from "@/components/checkout/types";

type OrderTypeSelectorProps = {
  value: CheckoutOrderType;
  onChange: (value: CheckoutOrderType) => void;
};

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { value: "Pickup" as const, label: "Pickup", description: "Swing by and grab your order hot.", Icon: Store },
        { value: "Delivery" as const, label: "Delivery", description: "We'll bring the smokehouse to you.", Icon: MapPin },
      ].map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border p-4 text-left transition ${active ? "border-gold bg-card" : "border-border bg-background/50 hover:border-gold/30"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-full border p-2 ${active ? "border-gold/50 text-gold" : "border-border text-muted-foreground"}`}>
                <option.Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-stencil text-sm uppercase tracking-[0.2em]">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
