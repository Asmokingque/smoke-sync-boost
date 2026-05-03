import { motion } from "framer-motion";
import { Plus, Clock, Calendar as CalendarIcon, Flame } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import {
  type Special,
  SPECIAL_TYPE_LABEL,
  formatTimeRange,
  formatWeekdays,
  isOrderableNow,
  isVisibleNow,
} from "@/lib/specials";

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

  const handleAdd = () => {
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

      <button
        onClick={handleAdd}
        disabled={!orderable}
        className="luxury-primary-btn h-12 font-stencil text-xs tracking-widest inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showSoldOut ? "Sold Out" : !isVisibleNow(special) ? "Currently Unavailable" : !orderable ? "Outside Hours" : (<><Plus className="h-4 w-4" /> Add to Order</>)}
      </button>
    </motion.article>
  );
}
