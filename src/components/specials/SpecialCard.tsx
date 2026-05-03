import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, Calendar as CalendarIcon, Flame, Package } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  type Special,
  SPECIAL_TYPE_LABEL,
  formatTimeRange,
  formatWeekdays,
  isOrderableNow,
  isVisibleNow,
} from "@/lib/specials";

type SpecialItemRow = {
  id: string;
  special_id: string;
  menu_item_id: string | null;
  item_name: string;
  description: string | null;
  regular_price: number | null;
  special_price: number;
  included_sides: number;
  display_order: number;
  is_active: boolean;
};

export function SpecialCard({
  special,
  index = 0,
  variant = "default",
}: {
  special: Special;
  index?: number;
  variant?: "default" | "hero";
}) {
  const addItem = useCart((s) => s.addItem);
  const orderable = isOrderableNow(special);
  const showSoldOut = special.sold_out;
  const [items, setItems] = useState<SpecialItemRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("special_items" as any)
        .select("*")
        .eq("special_id", special.id)
        .eq("is_active", true)
        .order("display_order");
      if (!cancelled && data) setItems(data as unknown as SpecialItemRow[]);
    })();
    return () => { cancelled = true; };
  }, [special.id]);

  const addSpecialToCart = () => {
    if (!orderable) return;
    addItem({
      id: `special-${special.id}`,
      menuItemId: special.id,
      name: special.title,
      price: Number(special.special_price),
      priceLabel: SPECIAL_TYPE_LABEL[special.type],
    });
    toast.success(`${special.title} added`, { duration: 1800 });
  };

  const addSpecialItem = (it: SpecialItemRow) => {
    if (!orderable) return;
    addItem({
      id: `special-item-${it.id}`,
      menuItemId: it.menu_item_id ?? special.id,
      name: `${special.title} — ${it.item_name}`,
      price: Number(it.special_price),
      priceLabel: SPECIAL_TYPE_LABEL[special.type],
    });
    toast.success(`${it.item_name} added`, { duration: 1600 });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className={`group luxury-card flex flex-col ${variant === "hero" ? "p-8 md:p-10" : "p-7"} ${
        !special.is_active || showSoldOut ? "opacity-70" : ""
      }`}
    >
      <span aria-hidden className="retina-shine rounded-[32px]" />

      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <span className="luxury-badge inline-flex items-center gap-1.5">
            <Flame className="h-3 w-3" />
            {SPECIAL_TYPE_LABEL[special.type]}
          </span>
          {special.type === "daily" && variant === "hero" && (
            <span className="luxury-badge inline-flex">Today Only</span>
          )}
          {showSoldOut && (
            <span className="luxury-badge inline-flex" style={{ color: "hsl(var(--bbq-ember))", borderColor: "hsl(var(--bbq-ember) / 0.6)" }}>
              Sold Out
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          {special.regular_price && Number(special.regular_price) > Number(special.special_price) && (
            <div className="text-xs text-muted-foreground line-through font-stencil mb-1">
              ${Number(special.regular_price).toFixed(2)}
            </div>
          )}
          <span className="luxury-price font-serif text-base">
            ${Number(special.special_price).toFixed(2)}
          </span>
        </div>
      </div>

      <h3 className={`luxury-menu-title leading-tight mb-3 ${variant === "hero" ? "text-4xl md:text-5xl" : "text-2xl"}`}>
        {special.title}
      </h3>
      <span className="luxury-divider mb-4" />
      {special.description && (
        <p className="luxury-subtitle text-sm mb-5 flex-1">{special.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-xs text-muted-foreground font-stencil tracking-wider">
        {(special.start_time || special.end_time) && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gold" />
            {formatTimeRange(special.start_time, special.end_time)}
          </span>
        )}
        {special.weekdays && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-gold" />
            {formatWeekdays(special.weekdays)}
          </span>
        )}
        {special.available_until && (
          <span className="inline-flex items-center gap-1.5 text-gold">
            Through {new Date(special.available_until + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-5 rounded-xl border border-gold/20 bg-background/40 p-3 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-stencil tracking-[0.25em] uppercase text-gold">
            <Package className="h-3 w-3" /> Included Items
          </div>
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 border-t border-border/40 pt-2 first:border-0 first:pt-0">
              <div className="min-w-0">
                <div className="text-sm text-foreground truncate">{it.item_name}</div>
                {it.description && (
                  <div className="text-[11px] text-muted-foreground truncate">{it.description}</div>
                )}
                <div className="text-[11px] text-gold mt-0.5">
                  ${Number(it.special_price).toFixed(2)}
                  {it.included_sides > 0 && (
                    <span className="text-muted-foreground ml-2">+{it.included_sides} sides</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => addSpecialItem(it)}
                disabled={!orderable}
                className="luxury-secondary-btn h-8 px-3 font-stencil text-[10px] tracking-widest inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label={`Add ${it.item_name}`}
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addSpecialToCart}
        disabled={!orderable}
        className="luxury-primary-btn h-12 font-stencil text-xs tracking-widest inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showSoldOut ? "Sold Out" : !isVisibleNow(special) ? "Currently Unavailable" : !orderable ? "Outside Hours" : (<><Plus className="h-4 w-4" /> Add Special to Order</>)}
      </button>
    </motion.article>
  );
}
