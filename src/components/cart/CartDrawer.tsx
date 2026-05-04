import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { SecureCheckoutButton } from "@/components/cart/SecureCheckoutButton";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const total = subtotal();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-charcoal-light/95 backdrop-blur-xl border-l border-gold/30 relative">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <SheetTitle className="font-serif text-3xl tracking-tight">Your Order</SheetTitle>
          <span className="gold-rule-short" />
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
                {items.map((item) => {
                  const opts = item.selectedOptions ?? [];
                  const optionsTotal = opts.reduce((s, o) => s + Number(o.price_adjustment ?? 0), 0);
                  const basePrice = item.price - optionsTotal;
                  const lineTotal = item.price * item.quantity;
                  return (
                    <li key={item.id} className="flex gap-3 pb-4 border-b border-border/50">
                      <div className="flex-1 min-w-0">
                        <div className="font-stencil text-sm text-foreground">{item.name}</div>

                        {/* Per-line price breakdown */}
                        {(opts.length > 0 || item.notes) && (
                          <div className="mt-2 rounded-md bg-background/60 border border-border/50 p-2 space-y-0.5 text-[11px]">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Base</span>
                              <span>${basePrice.toFixed(2)}</span>
                            </div>
                            {opts.map((o, idx) => (
                              <div key={idx} className="flex justify-between text-muted-foreground">
                                <span className="truncate pr-2">
                                  <span className="text-muted-foreground/60">{o.group}:</span> {o.name}
                                </span>
                                <span
                                  className={
                                    o.price_adjustment > 0
                                      ? "text-primary shrink-0"
                                      : o.price_adjustment < 0
                                      ? "text-emerald-400 shrink-0"
                                      : "text-muted-foreground/60 shrink-0"
                                  }
                                >
                                  {o.price_adjustment > 0
                                    ? `+$${Number(o.price_adjustment).toFixed(2)}`
                                    : o.price_adjustment < 0
                                    ? `−$${Math.abs(Number(o.price_adjustment)).toFixed(2)}`
                                    : "Included"}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between pt-1 mt-1 border-t border-border/40 text-foreground">
                              <span className="font-stencil">Unit</span>
                              <span className="font-stencil">${item.price.toFixed(2)}</span>
                            </div>
                            {item.notes && (
                              <div className="pt-1 mt-1 border-t border-border/40 text-muted-foreground/80 italic leading-snug">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                        )}

                        {item.priceLabel && !item.optionLabel && opts.length === 0 && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.priceLabel}</div>
                        )}

                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-[11px] text-muted-foreground">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </span>
                          <span className="text-sm font-display text-primary">${lineTotal.toFixed(2)}</span>
                        </div>
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
                  );
                })}
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
