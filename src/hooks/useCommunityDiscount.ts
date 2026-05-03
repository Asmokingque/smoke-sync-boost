import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CommunityDiscount = {
  id: string;
  title: string;
  description: string | null;
  eligible_groups: string[];
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_subtotal: number | null;
  max_discount: number | null;
  requires_id_verification: boolean;
  allow_online_selection: boolean;
  is_active: boolean;
  terms: string | null;
};

/** Loads the first active Community Heroes Deal (or null). */
export function useCommunityDiscount() {
  const [discount, setDiscount] = useState<CommunityDiscount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("community_discounts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const groups = Array.isArray(data.eligible_groups)
          ? (data.eligible_groups as string[])
          : [];
        setDiscount({ ...data, eligible_groups: groups } as CommunityDiscount);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { discount, loading };
}

/** Compute the dollar amount the discount removes from a given subtotal. */
export function computeCommunityDiscountAmount(
  d: CommunityDiscount | null,
  subtotal: number,
): number {
  if (!d) return 0;
  if (d.min_subtotal && subtotal < Number(d.min_subtotal)) return 0;
  let amt = 0;
  if (d.discount_type === "percentage") {
    const pct = Math.min(Math.max(Number(d.discount_value), 0), 100) / 100;
    amt = subtotal * pct;
  } else {
    amt = Math.min(Number(d.discount_value), subtotal);
  }
  if (d.max_discount && amt > Number(d.max_discount)) amt = Number(d.max_discount);
  return Math.round(amt * 100) / 100;
}
