import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { Plus, Loader2, Settings2, LayoutGrid, List, Star, Flame } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { OptionsPickerDialog } from "@/components/menu/OptionsPickerDialog";

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

  const grouped = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const c of categories) map[c.id] = [];
    for (const i of items) if (map[i.category_id]) map[i.category_id].push(i);
    return map;
  }, [categories, items]);

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
        {item.requires_options ? <><Settings2 className="h-4 w-4" />Customize</> : <><Plus className="h-4 w-4" />Add to Order</>}
      </Button>
    );
  };

  const CardItem = ({ item }: { item: Item }) => (
    <article className={`bg-gradient-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-primary/60 transition-colors ${!item.is_available ? "opacity-60" : ""}`}>
      {item.image_url && (
        <div className="aspect-[4/3] overflow-hidden bg-charcoal relative">
          <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          {!item.is_available && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground font-stencil text-[10px] px-2 py-1 rounded">Sold Out</div>
          )}
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-stencil text-base leading-tight">{item.name}</h3>
          <PriceTag item={item} />
        </div>
        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
        <div className="mt-auto pt-2"><AddButtons item={item} /></div>
      </div>
    </article>
  );

  const ListItem = ({ item }: { item: Item }) => (
    <article className={`flex items-center gap-4 py-4 border-b border-border/60 ${!item.is_available ? "opacity-60" : ""}`}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} loading="lazy" className="h-20 w-20 rounded-md object-cover bg-charcoal shrink-0" />
      ) : (
        <div className="h-20 w-20 rounded-md bg-charcoal-light shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-stencil text-base">{item.name}</h3>
          <PriceTag item={item} />
        </div>
        {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
      </div>
      <div className="shrink-0"><AddButtons item={item} compact /></div>
    </article>
  );

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">Order Online</div>
          <h1 className="font-display text-5xl md:text-6xl mb-3">Anderson's Smoking Que Menu</h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Real Smoke. Bold Flavor. Southern Comfort.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-11 px-6"><Link to="/menu">Start Order</Link></Button>
            <Button asChild variant="outline" className="font-stencil h-11 px-6 border-bone/40"><Link to="/catering">Order Catering</Link></Button>
          </div>
        </div>
      </section>

      {/* Sticky jump nav + view toggle */}
      <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-3 flex items-center gap-3">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {featured.length > 0 && (
                <button
                  onClick={() => jumpTo("featured")}
                  className={`font-stencil text-sm px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                    activeSlug === "featured" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/80 hover:bg-secondary/70"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />Featured
                </button>
              )}
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => jumpTo(c.slug)}
                  className={`font-stencil text-sm px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                    activeSlug === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/80 hover:bg-secondary/70"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-md p-1 shrink-0">
            <button
              onClick={() => setView("card")}
              aria-label="Card view"
              className={`p-2 rounded ${view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-2 rounded ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <section className="container py-10 space-y-16">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {featured.length > 0 && (
              <div id="cat-featured" className="scroll-mt-32">
                <div className="text-center mb-8">
                  <div className="menu-divider mb-4" />
                  <h2 className="font-display text-4xl md:text-5xl text-primary tracking-widest flex items-center justify-center gap-3">
                    <Flame className="h-8 w-8" /> FEATURED FAVORITES
                  </h2>
                  <div className="menu-divider mt-4" />
                  <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
                    Pitmaster picks — the bold, smoky favorites our regulars come back for.
                  </p>
                </div>
                {view === "card" ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map((item) => <CardItem key={item.id} item={item} />)}
                  </div>
                ) : (
                  <div>{featured.map((item) => <ListItem key={item.id} item={item} />)}</div>
                )}
              </div>
            )}

            {categories.map((cat) => (
              <div key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-32">
                <div className="text-center mb-8">
                  <div className="menu-divider mb-4" />
                  <h2 className="font-display text-4xl md:text-5xl text-primary tracking-widest">{cat.name.toUpperCase()}</h2>
                  <div className="menu-divider mt-4" />
                  {cat.description && (
                    <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">{cat.description}</p>
                  )}
                </div>
                {view === "card" ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[cat.id]?.map((item) => <CardItem key={item.id} item={item} />)}
                  </div>
                ) : (
                  <div>{grouped[cat.id]?.map((item) => <ListItem key={item.id} item={item} />)}</div>
                )}
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
