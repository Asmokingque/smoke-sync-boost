import { useRef, useState, ReactNode, MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCartUI } from "@/store/cartUi";

type Props = {
  /** Item name used for the toast + flying badge label. */
  itemName: string;
  /** Called when the user clicks. Should add the item to the existing cart store. */
  onAdd: () => void;
  /** Skip the flying animation + toast (e.g. when opening an options dialog instead). */
  fly?: boolean;
  /** Suppress the built-in toast (caller will show its own). */
  silent?: boolean;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

/**
 * Premium add-to-cart button for Anderson's Smoking Que.
 *
 * Wraps the existing cart store + cart UI store:
 * - Calls `onAdd()` so the caller mutates the real cart (no duplicate state).
 * - Triggers the flying ember animation toward the floating cart button.
 * - Pulses the cart count badge (handled by `useCartUI.fly`).
 * - Shows the standardized "{name} added to your order." toast.
 * - Briefly swaps its label to "Added!" with a check icon.
 */
export function AnimatedCartControls({
  itemName,
  onAdd,
  fly = true,
  silent = false,
  className,
  children,
  disabled,
  ariaLabel,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const flyFn = useCartUI((s) => s.fly);

  const handleClick = (_e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onAdd();
    if (fly && ref.current) {
      const r = ref.current.getBoundingClientRect();
      flyFn({
        name: itemName,
        from: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
      });
      if (!silent) {
        toast.success(`${itemName} added to your order.`, { duration: 2500 });
      }
    }
    setConfirmed(true);
    window.setTimeout(() => setConfirmed(false), 900);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel ?? `Add ${itemName} to order`}
      className={cn("relative overflow-hidden", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirmed ? (
          <motion.span
            key="added"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Added!
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center justify-center gap-1.5"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
