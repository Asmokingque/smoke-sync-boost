import { useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useRegisterMobileCartTarget } from "@/components/cart/CartPulseBadge";

type FloatingCartButtonProps = {
  cartCount: number;
  cartTotal?: number;
  isPulsing?: boolean;
  onClick: () => void;
};

export function FloatingCartButton({
  cartCount,
  cartTotal = 0,
  isPulsing = false,
  onClick,
}: FloatingCartButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useRegisterMobileCartTarget(ref);

  if (cartCount <= 0) return null;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      animate={
        isPulsing
          ? { scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }
          : { scale: 1, rotate: 0 }
      }
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-[9998] flex items-center gap-3 rounded-full border border-gold/40 bg-gradient-to-r from-primary to-primary/80 px-5 py-4 text-primary-foreground shadow-ember hover:from-primary hover:to-primary"
      aria-label={`Open cart, ${cartCount} items, $${cartTotal.toFixed(2)}`}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {cartCount > 0 && (
          <motion.span
            key={cartCount}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-3 -top-3 flex h-6 min-w-6 items-center justify-center rounded-full border border-gold bg-background px-1 text-xs font-black text-foreground"
          >
            {cartCount}
          </motion.span>
        )}
      </div>
      <div className="hidden text-left sm:block">
        <p className="font-stencil text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Cart
        </p>
        <p className="text-sm font-black">${cartTotal.toFixed(2)}</p>
      </div>
    </motion.button>
  );
}
