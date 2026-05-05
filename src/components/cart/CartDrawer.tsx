import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Minus, Plus, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  const sub = subtotal();
  const tax = sub * 0.0825;
  const total = sub + tax;

  const onClose = () => onOpenChange(false);
  const onCheckout = () => {
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-label="Your order"
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col border-l border-gold/30 bg-background shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
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
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const optionLabels =
                      item.selectedOptions?.map((o) => `${o.group}: ${o.name}`) ?? [];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-2xl border border-gold/20 bg-card p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-stencil font-bold text-foreground">{item.name}</h3>
                            {optionLabels.length > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {optionLabels.join(", ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="mt-1 text-xs text-gold">Note: {item.notes}</p>
                            )}
                          </div>
                          <p className="font-display text-lg font-black text-gold shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-full p-2 text-foreground hover:bg-secondary"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-8 text-center font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-full p-2 text-foreground hover:bg-secondary"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gold/20 bg-card p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gold/20" />
                <div className="flex justify-between text-xl font-black text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <motion.button
                type="button"
                disabled={items.length === 0}
                onClick={onCheckout}
                whileHover={{ scale: items.length ? 1.02 : 1 }}
                whileTap={{ scale: items.length ? 0.97 : 1 }}
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
