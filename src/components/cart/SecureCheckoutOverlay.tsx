import { motion, AnimatePresence } from "framer-motion";
import { Lock, Flame } from "lucide-react";

export function SecureCheckoutOverlay({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="secure-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-xl"
          aria-live="polite"
          role="status"
        >
          {/* Smoke / ember glow backdrop */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1.4 }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
            className="absolute h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[160px]"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.45, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-[24rem] w-[24rem] rounded-full bg-accent/30 blur-[120px]"
          />

          <div className="relative flex flex-col items-center text-center px-6">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="relative mb-8"
            >
              <span aria-hidden className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full border border-gold/50 bg-gradient-to-br from-card to-background flex items-center justify-center shadow-[0_0_60px_hsl(var(--bbq-ember)/0.55)] ring-1 ring-gold/40">
                <Lock className="h-10 w-10 text-gold" strokeWidth={1.5} />
              </div>
              {/* Floating ember */}
              <motion.span
                aria-hidden
                animate={{ y: [-2, -16, -2], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_0_24px_hsl(var(--bbq-ember)/0.8)]"
              >
                <Flame className="h-3.5 w-3.5" />
              </motion.span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-stencil text-[10px] tracking-[0.4em] text-gold uppercase mb-3"
            >
              Secure Connection
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-3xl md:text-4xl tracking-tight text-foreground mb-2"
            >
              Preparing your <span className="italic text-gradient-ember">secure checkout</span>…
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm text-muted-foreground max-w-sm"
            >
              Verifying your order with the smokehouse and opening a private payment session.
            </motion.p>

            {/* Progress shimmer */}
            <div className="mt-8 h-[2px] w-56 overflow-hidden rounded-full bg-border/50">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
