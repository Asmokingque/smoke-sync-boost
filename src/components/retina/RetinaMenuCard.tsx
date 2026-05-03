import { motion } from "framer-motion";
import { Plus, Settings2, Star, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      className={cn(
        "group retina-menu-card flex flex-col hover:shadow-ember hover:border-primary/40",
        !item.is_available && "opacity-60",
        className,
      )}
    >
      {/* Crimson top accent line */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
      {/* Shine sweep */}
      <span aria-hidden className="retina-shine rounded-3xl" />

      {item.image_url ? (
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
          {!item.is_available && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground font-stencil text-[10px]">Sold Out</Badge>
          )}
          {item.is_featured && item.is_available && (
            <Badge className="absolute top-3 left-3 bg-background/70 backdrop-blur border border-primary/40 text-primary font-stencil text-[10px]">
              <Star className="h-3 w-3 mr-1 fill-primary" /> Favorite
            </Badge>
          )}
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center relative">
          <Flame className="h-12 w-12 text-primary/30" />
          {!item.is_available && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground font-stencil text-[10px]">Sold Out</Badge>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-stencil text-base leading-tight text-foreground">{item.name}</h3>
          <PricePill item={item} />
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
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
      <span className="inline-flex items-center font-display text-base text-primary-foreground bg-primary/90 border border-primary px-2.5 py-1 rounded-full leading-none shadow-[0_4px_14px_hsl(var(--bbq-crimson)/0.4)]">
        {item.price_alt
          ? `$${Number(item.price).toFixed(0)} / $${Number(item.price_alt).toFixed(0)}`
          : `$${Number(item.price).toFixed(2)}`}
      </span>
      {item.price_label && (
        <div className="text-[10px] text-muted-foreground mt-1 font-stencil">{item.price_label}</div>
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
  if (item.price_alt && onAddAlt) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onAdd} className={baseBtn}>
          <Plus className="h-3.5 w-3.5" />${Number(item.price).toFixed(0)}
        </button>
        <button onClick={onAddAlt} className={baseBtn}>
          <Plus className="h-3.5 w-3.5" />${Number(item.price_alt).toFixed(0)}
        </button>
      </div>
    );
  }
  return (
    <button onClick={onAdd} className={`${baseBtn} w-full text-sm h-11`}>
      {item.requires_options ? (
        <><Settings2 className="h-4 w-4" />Customize</>
      ) : (
        <><Plus className="h-4 w-4" />Add to Order</>
      )}
    </button>
  );
}
