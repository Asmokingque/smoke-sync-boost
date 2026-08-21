import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useRegisterMobileCartTarget } from "@/components/cart/CartPulseBadge";

type FloatingCartButtonProps = {
  cartCount: number;
  cartTotal?: number;
  pulseKey?: number;
  onClick: () => void;
};

export function FloatingCartButton({ cartCount, cartTotal = 0, pulseKey = 0, onClick }: FloatingCartButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  useRegisterMobileCartTarget(ref);

  if (cartCount <= 0) return null;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      key={`floating-cart-${pulseKey}`}
      animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
      transition={reducedMotion ? undefined : { duration: 0.28, ease: "easeOut" }}
      whileHover={reducedMotion ? undefined : { scale: 1.03 }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      className="fixed bottom-6 right-4 z-[9998] flex items-center gap-3 rounded-full border border-gold/40 bg-gradient-to-r from-primary to-primary/80 px-5 py-4 text-primary-foreground shadow-ember hover:from-primary hover:to-primary sm:right-6"
      aria-label={`Open cart, ${cartCount} items, $${cartTotal.toFixed(2)}`}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -right-3 -top-3 flex h-6 min-w-6 items-center justify-center rounded-full border border-gold bg-background px-1 text-xs font-black text-foreground">
          {cartCount}
        </span>
      </div>
      <div className="hidden text-left sm:block">
        <p className="font-stencil text-xs font-bold uppercase tracking-[0.18em] text-gold">Cart</p>
        <p className="text-sm font-black">${cartTotal.toFixed(2)}</p>
      </div>
    </motion.button>
  );
}
