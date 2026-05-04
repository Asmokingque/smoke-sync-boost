import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useCartUI } from "@/store/cartUi";

/** Small animated count badge — used inside the desktop header cart icon. */
export function CartPulseBadge() {
  const count = useCart((s) => s.itemCount());
  const pulseKey = useCartUI((s) => s.pulseKey);

  if (count <= 0) return null;

  return (
    <span className="absolute -right-0.5 -top-0.5 h-5 w-5 pointer-events-none">
      {/* pulse ring */}
      <AnimatePresence>
        <motion.span
          key={`ring-${pulseKey}`}
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-primary/60"
          aria-hidden
        />
      </AnimatePresence>
      <motion.span
        key={`count-${count}-${pulseKey}`}
        initial={{ scale: 1.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 480, damping: 16 }}
        className="relative flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-[0_0_12px_hsl(var(--bbq-ember)/0.55)]"
      >
        {count}
      </motion.span>
    </span>
  );
}

/** Hook that registers a DOM ref as the desktop cart target for flying animations. */
export function useRegisterDesktopCartTarget(ref: React.RefObject<HTMLElement>) {
  const setRect = useCartUI((s) => s.setDesktopCartRect);
  useEffect(() => {
    const update = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [ref, setRect]);
}

/** Hook for mobile floating cart button. */
export function useRegisterMobileCartTarget(ref: React.RefObject<HTMLElement>) {
  const setRect = useCartUI((s) => s.setMobileCartRect);
  useEffect(() => {
    const update = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
      else setRect(null);
    };
    update();
    const id = window.setInterval(update, 500);
    window.addEventListener("resize", update);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", update);
    };
  }, [ref, setRect]);
}
