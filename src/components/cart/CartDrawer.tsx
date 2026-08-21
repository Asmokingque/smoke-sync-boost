import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartSummary } from "@/components/cart/CartSummary";
import { trackEvent } from "@/lib/analytics";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { items, estimatedSubtotal, updateQuantity, removeItem } = useCart();

  const onClose = () => onOpenChange(false);
  const onCheckout = () => {
    trackEvent("cart_opened", { source: "drawer_checkout" });
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cart-overlay"
            className="fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-label="Your order"
            className="fixed right-0 top-0 z-[9999] flex h-full w-[calc(100vw-1rem)] max-w-[460px] flex-col border-l border-gold/30 bg-background shadow-2xl sm:w-full"
            initial={reducedMotion ? false : { x: "100%" }}
            animate={reducedMotion ? undefined : { x: 0 }}
            exit={reducedMotion ? undefined : { x: "100%" }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="border-b border-gold/20 bg-card/95 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-stencil text-xs font-bold uppercase tracking-[0.2em] text-gold">
                    Anderson's Smoking Que
                  </p>
                  <h2 className="font-serif text-3xl text-foreground">Your Order</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-border bg-secondary/40 p-2 text-foreground hover:bg-secondary"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-lg font-bold text-foreground">Your cart is empty.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your favorite smokehouse items to get started.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false} mode="popLayout">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItemCard
                        key={item.cartItemId}
                        item={item}
                        reducedMotion={!!reducedMotion}
                        onDecrease={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        onIncrease={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        onRemove={() => removeItem(item.cartItemId)}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            <div className="border-t border-gold/20 bg-card p-5">
              <CartSummary subtotal={estimatedSubtotal} />
              <motion.button
                type="button"
                disabled={items.length === 0}
                onClick={onCheckout}
                whileHover={reducedMotion || !items.length ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion || !items.length ? undefined : { scale: 0.97 }}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-full border border-gold/40 bg-gradient-to-r from-primary to-primary/80 px-6 py-4 font-stencil font-bold tracking-wider text-primary-foreground shadow-ember hover:from-primary hover:to-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Lock className="h-5 w-5" />
                Secure Checkout
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
