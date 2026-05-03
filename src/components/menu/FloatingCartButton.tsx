import { useCart } from "@/store/cart";
import { ShoppingCart } from "lucide-react";

export function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const itemCount = useCart((s) => s.itemCount());
  const total = useCart((s) => s.subtotal());
  if (itemCount === 0) return null;
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full pl-4 pr-5 h-14 shadow-ember font-stencil tracking-wider"
      aria-label={`View cart, ${itemCount} items, $${total.toFixed(2)}`}
    >
      <span className="relative">
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background text-primary text-[10px] font-bold flex items-center justify-center border border-primary">
          {itemCount}
        </span>
      </span>
      <span className="text-sm">View Order</span>
      <span className="text-sm">·</span>
      <span className="font-display text-lg">${total.toFixed(2)}</span>
    </button>
  );
}
