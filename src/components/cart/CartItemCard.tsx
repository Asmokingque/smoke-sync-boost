import { motion } from "framer-motion";
import { Flame, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types/cart";

export type CartItemCardProps = {
  item: CartItem;
  reducedMotion?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CartItemCard({ item, reducedMotion = false, onDecrease, onIncrease, onRemove }: CartItemCardProps) {
  return (
    <motion.div
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98, height: 0 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1, height: "auto" }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, marginBottom: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-gold/20 bg-card"
    >
      <div className="flex gap-4 p-4">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.itemName} className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-gold/10 bg-background/60 text-gold/70">
            <Flame className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-stencil text-sm font-bold text-foreground">{item.itemName}</h3>
              {item.selectedOptionsForDisplay.length > 0 && (
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  {item.selectedOptionsForDisplay.map((option) => (
                    <li key={`${option.group}-${option.name}`}>
                      {option.group}: {option.name}
                      {option.priceAdjustment > 0 ? ` (+$${option.priceAdjustment.toFixed(2)})` : ""}
                    </li>
                  ))}
                </ul>
              )}
              {item.notes && <p className="mt-2 text-xs text-gold">Note: {item.notes}</p>}
            </div>
            <p className="shrink-0 font-display text-lg font-black text-gold">
              ${item.estimatedLineTotal.toFixed(2)}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 p-1">
              <button
                type="button"
                onClick={onDecrease}
                className="rounded-full p-2 text-foreground transition hover:bg-secondary"
                aria-label={`Decrease quantity for ${item.itemName}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
              <button
                type="button"
                onClick={onIncrease}
                className="rounded-full p-2 text-foreground transition hover:bg-secondary"
                aria-label={`Increase quantity for ${item.itemName}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${item.itemName}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
