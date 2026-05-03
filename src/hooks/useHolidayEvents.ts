import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HolidayEvent = {
  id: string;
  holiday_name: string;
  holiday_date: string; // YYYY-MM-DD
  holiday_type: string;
  business_status: "Open" | "Closed" | "Special Hours" | string | null;
  open_time: string | null;
  close_time: string | null;
  banner_title: string | null;
  banner_message: string | null;
  special_id: string | null;
  is_active: boolean;
  display_order: number;
};

export function useHolidayEvents(opts?: { upcomingOnly?: boolean }) {
  const [events, setEvents] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("holiday_events")
        .select("*")
        .eq("is_active", true)
        .order("holiday_date", { ascending: true });
      if (cancelled || !data) { setLoading(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const list = opts?.upcomingOnly
        ? data.filter((d: any) => d.holiday_date >= today)
        : data;
      setEvents(list as unknown as HolidayEvent[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts?.upcomingOnly]);

  return { events, loading };
}
