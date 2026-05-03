import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Special, SpecialType } from "@/lib/specials";

export function useSpecials(filter?: { type?: SpecialType; activeOnly?: boolean }) {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase.from("specials").select("*").order("display_order").order("created_at");
      if (filter?.type) q = q.eq("type", filter.type);
      if (filter?.activeOnly !== false) q = q.eq("is_active", true);
      const { data } = await q;
      if (!cancelled && data) setSpecials(data as unknown as Special[]);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.type, filter?.activeOnly]);

  return { specials, loading };
}
