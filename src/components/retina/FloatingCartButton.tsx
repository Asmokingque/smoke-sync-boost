import { useEffect, useRef } from "react";
import { useCart } from "@/store/cart";
import { ShoppingCart } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useCartUI } from "@/store/cartUi";
import { useRegisterMobileCartTarget } from "@/components/cart/CartPulseBadge";

export function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const itemCount = useCart((s) => s.itemCount());
  const total = useCart((s) => s.subtotal());
  const pulseKey = useCartUI((s) => s.pulseKey);
  const ref = useRef<HTMLButtonElement>(null);
  useRegisterMobileCartTarget(ref);

  const controls = useAnimation();
  useEffect(() => {
    if (pulseKey === 0) return;
    controls.start({
      y: [0, -14, 0, -6, 0],
      transition: { duration: 0.55, ease: "easeOut" },
    });
  }, [pulseKey, controls]);

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          ref={ref}
          key="floating-cart"
          initial={{ y: 80, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full pl-4 pr-5 h-14 shadow-ember font-stencil tracking-wider"
          aria-label={`View cart, ${itemCount} items, $${total.toFixed(2)}`}
        >
          <motion.span animate={controls} className="relative inline-flex">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-3.5 -right-3.5 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-gradient-ember text-primary-foreground text-xs font-stencil font-bold flex items-center justify-center border-2 border-background shadow-ember ring-1 ring-primary/60">
              <motion.span
                key={`pulse-${pulseKey}`}
                aria-hidden
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-primary/60"
              />
              <motion.span
                key={`count-${itemCount}-${pulseKey}`}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="relative"
              >
                {itemCount}
              </motion.span>
            </span>
          </motion.span>
          <span className="text-sm">View Order</span>
          <span className="text-sm">·</span>
          <span className="font-display text-lg">${total.toFixed(2)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
