import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useCartUI } from "@/store/cartUi";

export function FlyingCartLayer() {
  const flying = useCartUI((s) => s.flying);
  const removeFlying = useCartUI((s) => s.removeFlying);
  const desktopRect = useCartUI((s) => s.desktopCartRect);
  const mobileRect = useCartUI((s) => s.mobileCartRect);

  const isMobileView = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  const target = isMobileView && mobileRect ? mobileRect : desktopRect;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {flying.map((f) => {
          const toX = target ? target.left + target.width / 2 : window.innerWidth - 40;
          const toY = target ? target.top + target.height / 2 : 40;
          return (
            <motion.div
              key={f.id}
              initial={{
                x: f.from.x - 20,
                y: f.from.y - 20,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: toX - 20,
                y: toY - 20,
                scale: 0.35,
                opacity: 0.9,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.6, 0.05, 0.4, 1],
              }}
              onAnimationComplete={() => removeFlying(f.id)}
              className="absolute top-0 left-0 h-10 w-10 rounded-full bg-gradient-ember text-primary-foreground flex items-center justify-center shadow-[0_0_28px_hsl(var(--bbq-ember)/0.7)] ring-1 ring-gold/50"
              aria-hidden
            >
              <Flame className="h-5 w-5" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
