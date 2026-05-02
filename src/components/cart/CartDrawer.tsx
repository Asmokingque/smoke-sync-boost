import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const total = subtotal();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-charcoal-light border-border">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-display text-2xl tracking-wider">Your Order</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Button asChild onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 pb-4 border-b border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="font-stencil text-sm text-foreground">{item.name}</div>
                      {item.optionLabel && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.optionLabel}</div>
                      )}
                      {item.notes && (
                        <div className="text-[11px] italic text-muted-foreground/80 mt-0.5">Note: {item.notes}</div>
                      )}
                      {item.priceLabel && !item.optionLabel && <div className="text-xs text-muted-foreground">{item.priceLabel}</div>}
                      <div className="text-sm text-primary mt-1">${item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-1 bg-background rounded-md border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-9 w-9 flex items-center justify-center hover:bg-secondary rounded-l-md"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-9 w-9 flex items-center justify-center hover:bg-secondary rounded-r-md"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="border-t border-border p-6 space-y-4 bg-background/50">
              <div className="flex justify-between text-lg">
                <span className="font-stencil">Subtotal</span>
                <span className="font-display text-2xl text-primary">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Tax calculated at checkout</p>
              <Button
                asChild
                onClick={() => onOpenChange(false)}
                className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil text-base"
              >
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
