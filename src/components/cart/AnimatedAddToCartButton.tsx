import { useRef, useState, ReactNode, MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartUI } from "@/store/cartUi";

type Props = {
  onAdd: () => void;
  itemName: string;
  /** Pass false to skip the flying animation (e.g., when opening an options dialog instead). */
  fly?: boolean;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

export function AnimatedAddToCartButton({
  onAdd,
  itemName,
  fly = true,
  className,
  children,
  disabled,
  ariaLabel,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const flyFn = useCartUI((s) => s.fly);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onAdd();
    if (fly && ref.current) {
      const r = ref.current.getBoundingClientRect();
      flyFn({
        name: itemName,
        from: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
      });
    }
    setConfirmed(true);
    window.setTimeout(() => setConfirmed(false), 900);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
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
