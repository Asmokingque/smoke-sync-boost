import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { SecureCheckoutOverlay } from "./SecureCheckoutOverlay";

type Props = {
  /**
   * Optional async hook — e.g. call a Supabase Edge Function to create a
   * Stripe Checkout Session. Return a URL to redirect to, or void to fall
   * back to navigating to `/checkout` (current in-app flow).
   */
  onCheckout?: () => Promise<string | void> | string | void;
  onBeforeNavigate?: () => void;
  className?: string;
  label?: string;
};

export function SecureCheckoutButton({
  onCheckout,
  onBeforeNavigate,
  className = "",
  label = "Secure Checkout",
}: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    onBeforeNavigate?.();
    // Hold the overlay long enough to feel premium even on instant nav.
    const minDelay = new Promise((r) => setTimeout(r, 850));
    try {
      const result = onCheckout ? await Promise.resolve(onCheckout()) : undefined;
      await minDelay;
      if (typeof result === "string" && result.length > 0) {
        window.location.href = result;
        return;
      }
      navigate("/checkout");
    } catch (err) {
      console.error("Secure checkout failed", err);
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={busy}
        whileTap={{ scale: 0.98 }}
        className={[
          "group relative w-full h-12 rounded-md font-stencil text-sm tracking-[0.18em] uppercase",
          "bg-primary text-primary-foreground border border-gold/40",
          "shadow-[0_0_24px_hsl(var(--bbq-ember)/0.45)] hover:shadow-[0_0_42px_hsl(var(--bbq-ember)/0.7)]",
          "transition-shadow duration-300 disabled:opacity-70 disabled:cursor-wait",
          "inline-flex items-center justify-center gap-2 overflow-hidden",
          className,
        ].join(" ")}
        aria-label={label}
      >
        {/* subtle glow sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/30 to-transparent group-hover:translate-x-full transition-transform duration-[1200ms]"
        />
        <Lock className="h-4 w-4" strokeWidth={2} />
        <span className="relative">{label}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
      <SecureCheckoutOverlay open={busy} />
    </>
  );
}
