/**
 * useMenuData.ts
 * ---------------------------------------------------------------------------
 * Single source of truth for menu categories + items.
 *
 * Loading logic:
 *   1. Try to load from the backend (Lovable Cloud / Supabase).
 *   2. If the backend isn't configured, errors, or returns no rows,
 *      fall back to the static data in src/data/menuData.ts.
 *   3. Live updates (admin dashboard edits) stream in over realtime.
 *
 * `usingFallback` tells the UI whether it is showing static demo data.
 * ---------------------------------------------------------------------------
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type FallbackCategory, type FallbackMenuItem } from "@/data/menuData";
import { useFallbackMenu } from "@/hooks/useEditableContent";

export type MenuCategory = FallbackCategory;
export type MenuItem = FallbackMenuItem;

export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const fallback = useFallbackMenu();

  useEffect(() => {
    let active = true;

    const applyFallback = () => {
      if (!active) return;
      setCategories(fallback.categories);
      setItems(fallback.items);
      setUsingFallback(true);
      setLoading(false);
    };

    const fetchAll = async () => {
      try {
        const [cats, its] = await Promise.all([
          supabase.from("menu_categories").select("*").order("display_order"),
          supabase.from("menu_items").select("*").order("display_order"),
        ]);
        if (!active) return;

        const hasLiveData = (cats.data?.length ?? 0) > 0 && (its.data?.length ?? 0) > 0;
        if (!hasLiveData || cats.error || its.error) {
          applyFallback();
          return;
        }

        // Admin-controlled visibility: hidden categories and sold-out /
        // ordering-disabled items never reach the customer menu as orderable.
        const visibleCats = (cats.data as unknown as Array<Record<string, unknown>>).filter(
          (c) => c.is_visible !== false,
        );
        const visibleCatIds = new Set(visibleCats.map((c) => c.id as string));
        const liveItems = (its.data as unknown as Array<Record<string, unknown>>)
          .filter((i) => visibleCatIds.has(i.category_id as string))
          .map((i) => ({
            ...i,
            is_available:
              i.is_available !== false && i.is_sold_out !== true && i.online_ordering_enabled !== false,
          }));

        setCategories(visibleCats as unknown as MenuCategory[]);
        setItems(liveItems as unknown as MenuItem[]);
        setUsingFallback(false);
        setLoading(false);
      } catch {
        applyFallback();
      }
    };

    fetchAll();

    const channel = supabase
      .channel("menu-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "menu_categories" }, (p) => {
        setCategories((prev) =>
          [...prev, p.new as MenuCategory].sort((a, b) => a.display_order - b.display_order)
        );
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "menu_categories" }, (p) => {
        setCategories((prev) =>
          prev
            .map((c) => (c.id === p.new.id ? (p.new as MenuCategory) : c))
            .sort((a, b) => a.display_order - b.display_order)
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "menu_categories" }, (p) => {
        setCategories((prev) => prev.filter((c) => c.id !== p.old.id));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "menu_items" }, (p) => {
        setItems((prev) => [...prev, p.new as MenuItem].sort((a, b) => a.display_order - b.display_order));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "menu_items" }, (p) => {
        setItems((prev) => prev.map((i) => (i.id === p.new.id ? (p.new as MenuItem) : i)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "menu_items" }, (p) => {
        setItems((prev) => prev.filter((i) => i.id !== p.old.id));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [fallback]);

  return { categories, items, loading, usingFallback };
}
