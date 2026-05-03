import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { Plus, Settings2, Flame, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { OptionsPickerDialog } from "@/components/menu/OptionsPickerDialog";
import { CateringCallout } from "@/components/menu/CateringCallout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { SmokeBackground } from "@/components/ui/SmokeBackground";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { FeaturedMenuCarousel } from "@/components/retina/FeaturedMenuCarousel";
import { RetinaMenuCard } from "@/components/retina/RetinaMenuCard";
import { CategoryJumpBar } from "@/components/retina/CategoryJumpBar";
import { SmokeDivider } from "@/components/retina/SmokeDivider";

type Category = { id: string; name: string; slug: string; display_order: number; description: string | null };
type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_alt: number | null;
  price_label: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  requires_options: boolean;
  allow_notes: boolean;
};

type ViewMode = "card" | "list";

const Menu = () => {
  const [pickerItem, setPickerItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string>("featured");
  const [view, setView] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    (async () => {
      const [cats, its] = await Promise.all([
        supabase.from("menu_categories").select("*").order("display_order"),
        supabase.from("menu_items").select("*").order("display_order"),
      ]);
      if (cats.data) setCategories(cats.data as Category[]);
      if (its.data) setItems(its.data as Item[]);
      setLoading(false);
    })();
  }, []);

  const featured = useMemo(() => items.filter((i) => i.is_featured && i.is_available), [items]);

  const matchesSearch = (i: Item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q);
  };

  const grouped = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const c of categories) map[c.id] = [];
    for (const i of items) if (map[i.category_id] && matchesSearch(i)) map[i.category_id].push(i);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, items, search]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => (grouped[c.id] ?? []).length > 0),
    [categories, grouped],
  );

  const handleAdd = (item: Item, useAltPrice = false) => {
    if (!item.is_available) return;
    if (item.requires_options) {
      setPickerItem(item);
      return;
    }
    const price = useAltPrice && item.price_alt ? Number(item.price_alt) : Number(item.price ?? 0);
    if (price <= 0) {
      toast.info("Contact us for pricing on this item.");
      return;
    }
    const variantId = useAltPrice ? `${item.id}-alt` : item.id;
    const variantLabel = item.price_label && item.price_alt
      ? (useAltPrice ? item.price_label.split("/").pop()?.trim() : item.price_label.split("/")[0]?.trim())
      : item.price_label;
    addItem({
      id: variantId,
      menuItemId: item.id,
      name: item.name,
      price,
      priceLabel: variantLabel ?? undefined,
    });
    toast.success(`${item.name} added`, { duration: 1800 });
  };

  const jumpTo = (slug: string) => {
    setActiveSlug(slug);
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const PriceTag = ({ item }: { item: Item }) => (
    <div className="text-right shrink-0">
      {item.price_alt ? (
        <div className="font-display text-xl text-primary leading-none">
          ${Number(item.price).toFixed(0)}/${Number(item.price_alt).toFixed(0)}
        </div>
      ) : item.price ? (
        <div className="font-display text-xl text-primary leading-none">
          ${Number(item.price).toFixed(2)}
        </div>
      ) : (
        <div className="font-stencil text-xs text-muted-foreground">Market</div>
      )}
      {item.price_label && (
        <div className="text-[10px] text-muted-foreground mt-1 font-stencil">{item.price_label}</div>
      )}
    </div>
  );

  const AddButtons = ({ item, compact = false }: { item: Item; compact?: boolean }) => {
    if (!item.is_available) {
      return (
        <Button disabled className="h-11 font-stencil text-xs opacity-70">
          Sold Out
        </Button>
      );
    }
    if (item.price_alt) {
      return (
        <div className={`flex gap-2 ${compact ? "" : "w-full"}`}>
          <Button onClick={() => handleAdd(item, false)} className="flex-1 h-11 bg-primary hover:bg-primary/90 font-stencil text-xs">
            <Plus className="h-3.5 w-3.5" />${Number(item.price).toFixed(0)}
          </Button>
          <Button onClick={() => handleAdd(item, true)} className="flex-1 h-11 bg-primary hover:bg-primary/90 font-stencil text-xs">
            <Plus className="h-3.5 w-3.5" />${Number(item.price_alt).toFixed(0)}
          </Button>
        </div>
      );
    }
    return (
      <Button
        onClick={() => handleAdd(item)}
        className={`${compact ? "" : "w-full"} h-11 bg-primary hover:bg-primary/90 font-stencil text-sm`}
      >
        {item.requires_options ? <><Settings2 className="h-4 w-4" />Customize</> : <><Plus className="h-4 w-4" />Order Online</>}
      </Button>
    );
  };

  const CardItem = ({ item, index = 0 }: { item: Item; index?: number }) => (
    <RetinaMenuCard
      item={item}
      index={index}
      onAdd={() => handleAdd(item, false)}
      onAddAlt={item.price_alt ? () => handleAdd(item, true) : undefined}
    />
  );

  const ListItem = ({ item }: { item: Item }) => (
    <motion.article
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-4 py-4 border-b border-border/60 ${!item.is_available ? "opacity-60" : ""}`}
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} loading="lazy" className="h-20 w-20 rounded-md object-cover bg-charcoal shrink-0" />
      ) : (
        <div className="h-20 w-20 rounded-md bg-gradient-to-br from-charcoal-light to-charcoal shrink-0 flex items-center justify-center">
          <Flame className="h-6 w-6 text-primary/40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-stencil text-base">{item.name}</h3>
          <PriceTag item={item} />
        </div>
        {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
      </div>
      <div className="shrink-0"><AddButtons item={item} compact /></div>
    </motion.article>
  );

  return (
    <SiteLayout>
      {/* Hero with smoke + ember backdrop */}
      <section className="relative bg-gradient-smoke border-b border-gold/20 overflow-hidden">
        <SmokeBackground density="md" />
        <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 h-[28rem] w-[42rem] rounded-full bg-primary/20 blur-[140px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative container py-20 md:py-28 text-center"
        >
          <span className="badge-premium mb-6">
            <Flame className="h-3 w-3" />Order Online · Pickup &amp; Delivery
          </span>
          <h1 className="font-serif text-6xl md:text-8xl mb-2 leading-[0.95] tracking-tight">
            Anderson's Smoking Que
            <br />
            <span className="italic text-gradient-ember">Menu</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6 mb-6">
            <span className="gold-rule-short" />
            <p className="font-stencil text-xs md:text-sm text-gold tracking-[0.32em]">Real Smoke · Bold Flavor · Southern Comfort</p>
            <span className="gold-rule-short" />
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-base md:text-lg leading-relaxed">
            Hand-crafted plates and meats by the pound, built around generations of Southern smokehouse recipes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ShimmerButton onClick={() => document.getElementById("menu-start")?.scrollIntoView({ behavior: "smooth" })}>
              <Plus className="h-5 w-5" /> Start Order
            </ShimmerButton>
            <Button asChild variant="outline" className="font-stencil h-14 px-8 border-gold text-gold hover:bg-gold/10 hover:text-gold text-sm">
              <Link to="/catering">Request Catering</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Sticky jump nav + view toggle */}
      <div id="menu-start">
        <CategoryJumpBar
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          activeSlug={activeSlug}
          onJump={jumpTo}
          showFeatured={featured.length > 0}
          view={view}
          onViewChange={setView}
        />
        <div className="container py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the menu…"
              className="h-10 pl-9 pr-9 bg-card/50 border-border focus-visible:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="container py-10 space-y-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gradient-card border border-border rounded-xl overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-11 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {featured.length > 0 && !search && (
              <div id="cat-featured" className="scroll-mt-32">
                <div className="text-center mb-10">
                  <span className="badge-premium mb-4"><Flame className="h-3 w-3" />Pitmaster Picks</span>
                  <h2 className="font-serif text-5xl md:text-6xl mb-3 leading-tight">Featured Favorites</h2>
                  <span className="gold-rule-short mx-auto block mb-4" />
                  <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    The bold, smoky favorites our regulars come back for.
                  </p>
                </div>
                <FeaturedMenuCarousel
                  items={featured}
                  renderItem={(item, i) => <CardItem item={item as Item} index={i} />}
                />
              </div>
            )}

            {visibleCategories.length === 0 && search && (
              <div className="text-center py-20">
                <p className="font-stencil text-muted-foreground">No items match "{search}"</p>
                <Button onClick={() => setSearch("")} variant="outline" className="mt-4 font-stencil">
                  Clear search
                </Button>
              </div>
            )}

            {visibleCategories.map((cat, idx) => (
              <div key={cat.id}>
                {idx > 0 && idx % 2 === 0 && <CateringCallout />}
                <div id={`cat-${cat.slug}`} className="scroll-mt-32">
                  <div className="text-center mb-10">
                    <h2 className="font-serif text-5xl md:text-6xl mb-3 leading-tight">{cat.name}</h2>
                    <span className="gold-rule-short mx-auto block mb-4" />
                    {cat.description && (
                      <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">{cat.description}</p>
                    )}
                  </div>
                  {view === "card" ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[cat.id]?.map((item, i) => <CardItem key={item.id} item={item} index={i} />)}
                    </div>
                  ) : (
                    <div>{grouped[cat.id]?.map((item) => <ListItem key={item.id} item={item} />)}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      <OptionsPickerDialog
        open={!!pickerItem}
        onOpenChange={(o) => !o && setPickerItem(null)}
        item={pickerItem ? { id: pickerItem.id, name: pickerItem.name, base_price: Number(pickerItem.price ?? 0), allow_notes: pickerItem.allow_notes } : null}
        onConfirm={({ selectedOptions, notes, finalUnitPrice, optionLabel }) => {
          if (!pickerItem) return;
          const variantHash = selectedOptions.map((o) => `${o.group}:${o.name}`).join("|");
          addItem({
            id: `${pickerItem.id}__${variantHash}`,
            menuItemId: pickerItem.id,
            name: pickerItem.name,
            price: finalUnitPrice,
            priceLabel: optionLabel || pickerItem.price_label || undefined,
            optionLabel,
            selectedOptions,
            notes: notes || undefined,
          });
          toast.success(`${pickerItem.name} added`, { duration: 1800 });
        }}
      />
    </SiteLayout>
  );
};

export default Menu;
