import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Settings2, Star, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatedCartControls } from "@/components/cart/AnimatedCartControls";

export type RetinaMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  price_alt?: number | null;
  price_label?: string | null;
  image_url?: string | null;
  is_available: boolean;
  is_featured?: boolean;
  requires_options?: boolean;
};

export function RetinaMenuCard({
  item,
  index = 0,
  onAdd,
  onAddAlt,
  className,
}: {
  item: RetinaMenuItem;
  index?: number;
  onAdd: () => void;
  onAddAlt?: () => void;
  className?: string;
}) {
  const [pulsed, setPulsed] = useState(false);
  const pulseTimer = useRef<number | null>(null);
  const triggerPulse = () => {
    setPulsed(false);
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    // Re-apply on next frame so the animation restarts on rapid adds.
    requestAnimationFrame(() => {
      setPulsed(true);
      pulseTimer.current = window.setTimeout(() => setPulsed(false), 700);
    });
  };
  const handleAdd = () => { onAdd(); triggerPulse(); };
  const handleAddAlt = onAddAlt ? () => { onAddAlt(); triggerPulse(); } : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      className={cn(
        "group luxury-card flex flex-col",
        !item.is_available && "opacity-60",
        pulsed && "menu-card-added cart-ember-glow",
        className,
      )}
    >
      {/* Shine sweep */}
      <span aria-hidden className="retina-shine rounded-[32px]" />

      {item.image_url ? (
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
          {!item.is_available && (
            <span className="luxury-badge absolute top-3 right-3">Sold Out</span>
          )}
          {item.is_featured && item.is_available && (
            <span className="luxury-badge absolute top-3 left-3 inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> Favorite
            </span>
          )}
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center relative">
          <Flame className="h-12 w-12 text-primary/30" />
          {!item.is_available && (
            <span className="luxury-badge absolute top-3 right-3">Sold Out</span>
          )}
        </div>
      )}

      <div className="p-7 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="luxury-menu-title text-2xl leading-tight">{item.name}</h3>
          <PricePill item={item} />
        </div>
        <span aria-hidden className="luxury-divider" />
        {item.description && (
          <p className="luxury-subtitle text-sm">{item.description}</p>
        )}
        <div className="mt-auto pt-2">
          <AddButtons item={item} onAdd={onAdd} onAddAlt={onAddAlt} />
        </div>
      </div>
    </motion.article>
  );
}

function PricePill({ item }: { item: RetinaMenuItem }) {
  if (!item.price && !item.price_alt) {
    return <span className="font-stencil text-[10px] text-muted-foreground">Market</span>;
  }
  return (
    <div className="text-right shrink-0">
      <span className="luxury-price font-serif text-base leading-none">
        {item.price_alt
          ? `$${Number(item.price).toFixed(0)} / $${Number(item.price_alt).toFixed(0)}`
          : `${item.requires_options ? "From " : ""}$${Number(item.price).toFixed(2)}`}
      </span>
      {item.price_label && (
        <div className="text-[10px] text-gold mt-1.5 font-stencil tracking-widest">{item.price_label}</div>
      )}
    </div>
  );
}

function AddButtons({
  item,
  onAdd,
  onAddAlt,
}: {
  item: RetinaMenuItem;
  onAdd: () => void;
  onAddAlt?: () => void;
}) {
  const baseBtn =
    "h-11 inline-flex items-center justify-center gap-1.5 rounded-md font-stencil text-xs tracking-wider transition-all bg-primary text-primary-foreground border border-primary/60 hover:bg-primary/90 hover:shadow-[0_0_24px_hsl(var(--bbq-ember)/0.55)] active:scale-[0.98]";

  if (!item.is_available) {
    return (
      <button disabled className="h-11 w-full rounded-md bg-secondary text-muted-foreground font-stencil text-xs opacity-70 cursor-not-allowed">
        Sold Out
      </button>
    );
  }
  const flyOnAdd = !item.requires_options;

  if (item.price_alt && onAddAlt) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <AnimatedCartControls
          itemName={item.name}
          fly={flyOnAdd}
          onAdd={onAdd}
          className={baseBtn}
          ariaLabel={`Add ${item.name} for $${Number(item.price).toFixed(0)}`}
        >
          <Plus className="h-3.5 w-3.5" />${Number(item.price).toFixed(0)}
        </AnimatedCartControls>
        <AnimatedCartControls
          itemName={item.name}
          fly={flyOnAdd}
          onAdd={onAddAlt}
          className={baseBtn}
          ariaLabel={`Add ${item.name} for $${Number(item.price_alt).toFixed(0)}`}
        >
          <Plus className="h-3.5 w-3.5" />${Number(item.price_alt).toFixed(0)}
        </AnimatedCartControls>
      </div>
    );
  }
  return (
    <AnimatedCartControls
      itemName={item.name}
      fly={flyOnAdd}
      onAdd={onAdd}
      className={`${baseBtn} w-full text-sm h-11`}
      ariaLabel={`Add ${item.name} to order`}
    >
      {item.requires_options ? (
        <><Settings2 className="h-4 w-4" />Customize</>
      ) : (
        <><Plus className="h-4 w-4" />Add to Order</>
      )}
    </AnimatedCartControls>
  );
}
