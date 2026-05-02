import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; name: string; slug: string; display_order: number };
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
  display_order: number;
};

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string>("meats");
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

  const grouped = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const c of categories) map[c.id] = [];
    for (const i of items) if (map[i.category_id]) map[i.category_id].push(i);
    return map;
  }, [categories, items]);

  const handleAdd = (item: Item, useAltPrice = false) => {
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
      name: item.name,
      price,
      priceLabel: variantLabel ?? undefined,
    });
    toast.success(`${item.name} added`, { duration: 1800 });
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">Order Online</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4">The Menu</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tap an item to add it to your cart. Your order is held in your browser until checkout.
          </p>
        </div>
      </section>

      {/* Sticky category nav */}
      <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveSlug(c.slug);
                  document.getElementById(`cat-${c.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`font-stencil text-sm px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                  activeSlug === c.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/80 hover:bg-secondary/70"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="container py-10 space-y-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-32">
              <div className="text-center mb-8">
                <div className="menu-divider mb-4" />
                <h2 className="font-display text-4xl md:text-5xl text-primary tracking-widest">
                  {cat.name.toUpperCase()}
                </h2>
                <div className="menu-divider mt-4" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[cat.id]?.map((item) => (
                  <article
                    key={item.id}
                    className="bg-gradient-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-primary/60 transition-colors"
                  >
                    {item.image_url && (
                      <div className="aspect-[4/3] overflow-hidden bg-charcoal">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-stencil text-base text-foreground leading-tight">{item.name}</h3>
                      <div className="text-right shrink-0">
                        {item.price_alt ? (
                          <div className="font-display text-xl text-primary leading-none">
                            ${Number(item.price).toFixed(0)}/${Number(item.price_alt).toFixed(0)}
                          </div>
                        ) : (
                          <div className="font-display text-xl text-primary leading-none">
                            ${Number(item.price).toFixed(2)}
                          </div>
                        )}
                        {item.price_label && (
                          <div className="text-[10px] text-muted-foreground mt-1 font-stencil">{item.price_label}</div>
                        )}
                      </div>
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}

                    <div className="mt-auto pt-2 flex gap-2">
                      {item.price_alt ? (
                        <>
                          <Button
                            onClick={() => handleAdd(item, false)}
                            className="flex-1 h-11 bg-primary hover:bg-primary/90 font-stencil text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            ${Number(item.price).toFixed(0)}
                          </Button>
                          <Button
                            onClick={() => handleAdd(item, true)}
                            className="flex-1 h-11 bg-primary hover:bg-primary/90 font-stencil text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            ${Number(item.price_alt).toFixed(0)}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleAdd(item)}
                          className="w-full h-11 bg-primary hover:bg-primary/90 font-stencil text-sm"
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <Plus className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </SiteLayout>
  );
};

export default Menu;
