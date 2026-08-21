import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/hooks/useCart";

type CheckoutOrderSummaryProps = {
  deliveryFee?: number;
  discount?: number;
  tip?: number;
};

export function CheckoutOrderSummary({ deliveryFee = 0, discount = 0, tip = 0 }: CheckoutOrderSummaryProps) {
  const [open, setOpen] = useState(true);
  const { items, estimatedSubtotal } = useCart();

  return (
    <div className="rounded-3xl border border-gold/20 bg-card p-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 md:pointer-events-none"
      >
        <div>
          <div className="font-serif text-2xl text-foreground">Order Summary</div>
          <p className="text-sm text-muted-foreground">{items.length} line item{items.length === 1 ? "" : "s"}</p>
        </div>
        <ChevronDown className={`h-5 w-5 transition md:hidden ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`${open ? "mt-5 block" : "hidden"} md:block`}>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.cartItemId} className="flex justify-between gap-3 border-b border-border/50 pb-3 text-sm last:border-0">
              <div>
                <div className="font-medium text-foreground">
                  {item.quantity}× {item.itemName}
                </div>
                {item.selectedOptionsForDisplay.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {item.selectedOptionsForDisplay.map((option) => `${option.group}: ${option.name}`).join(" · ")}
                  </div>
                )}
              </div>
              <div className="font-display text-gold">${item.estimatedLineTotal.toFixed(2)}</div>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <CartSummary subtotal={estimatedSubtotal} deliveryFee={deliveryFee} discount={discount} tip={tip} />
        </div>
      </div>
    </div>
  );
}
