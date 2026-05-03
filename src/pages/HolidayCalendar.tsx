import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { FEDERAL_HOLIDAYS, type Holiday } from "@/lib/holidays";
import { useSpecials } from "@/hooks/useSpecials";
import { SpecialCard } from "@/components/specials/SpecialCard";
import { CalendarDays, Loader2, Clock, Store, X } from "lucide-react";
import { motion } from "framer-motion";

type HoursOverride = {
  id: string;
  override_date: string;
  status: "open" | "closed" | "special_hours";
  open_time: string | null;
  close_time: string | null;
  holiday_key: string | null;
  label: string | null;
  note: string | null;
};

const HolidayCalendar = () => {
  const [overrides, setOverrides] = useState<HoursOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHoliday, setActiveHoliday] = useState<Holiday | null>(null);
  const { specials } = useSpecials({ activeOnly: true });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("business_hours_overrides").select("*").order("override_date");
      setOverrides((data ?? []) as HoursOverride[]);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(
    () => FEDERAL_HOLIDAYS.filter((h) => h.date >= today).slice(0, 8),
    [today],
  );

  const overrideMap = useMemo(() => {
    const m: Record<string, HoursOverride> = {};
    for (const o of overrides) m[o.override_date] = o;
    return m;
  }, [overrides]);

  const specialFor = (key: string) => specials.find((s) => s.holiday_key === key);
  const overrideFor = (date: string) => overrideMap[date];

  return (
    <SiteLayout>
      <section className="relative border-b border-gold/20 overflow-hidden">
        <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 h-[24rem] w-[40rem] rounded-full bg-primary/20 blur-[140px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative container py-24 md:py-32 text-center"
        >
          <span className="luxury-eyebrow mb-6 inline-flex items-center gap-2"><CalendarDays className="h-3 w-3" /> Holiday Calendar</span>
          <h1 className="luxury-hero-title text-6xl md:text-7xl mb-2">
            Holiday <span className="italic text-gradient-ember">Calendar</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-8 mb-6">
            <span className="luxury-gold-line" />
            <p className="font-stencil text-xs md:text-sm text-gold tracking-[0.32em]">Hours · Closures · Holiday Specials</p>
            <span className="luxury-gold-line" />
          </div>
          <p className="luxury-subtitle max-w-xl mx-auto">
            Plan ahead — see when we're open, when we're closed, and which holidays come with a special from the pit.
          </p>
        </motion.div>
      </section>

      <section className="container py-14">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            <div className="space-y-4">
              <h2 className="luxury-menu-title text-3xl mb-2">Upcoming Holidays</h2>
              <span className="luxury-gold-line block mb-4" />
              {upcoming.map((h) => {
                const ov = overrideFor(h.date);
                const sp = specialFor(h.key);
                return (
                  <button
                    key={h.key}
                    onClick={() => setActiveHoliday(h)}
                    className="luxury-card w-full p-5 text-left flex items-center gap-4"
                  >
                    <div className="w-16 shrink-0 text-center">
                      <div className="font-stencil text-[10px] text-gold tracking-widest uppercase">
                        {new Date(h.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}
                      </div>
                      <div className="luxury-menu-title text-3xl leading-none">
                        {new Date(h.date + "T00:00:00").getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="luxury-menu-title text-xl truncate">{h.name}</div>
                      <div className="text-xs text-muted-foreground font-stencil tracking-wider mt-1">{h.category}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <StatusBadge ov={ov} />
                        {sp && <span className="luxury-badge">Special Available</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-24 h-fit luxury-card p-6 md:p-8">
              <h3 className="luxury-menu-title text-2xl mb-2">Closures &amp; Special Hours</h3>
              <span className="luxury-gold-line block mb-4" />
              {overrides.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming closures or special hours posted.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {overrides
                    .filter((o) => o.override_date >= today)
                    .map((o) => (
                    <li key={o.id} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0">
                      <CalendarDays className="h-4 w-4 text-gold mt-0.5" />
                      <div className="flex-1">
                        <div className="font-stencil text-xs uppercase tracking-wider text-foreground">
                          {new Date(o.override_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className="text-foreground/80">{o.label ?? "Holiday hours"}</div>
                        <StatusBadge ov={o} />
                        {o.note && <div className="text-xs text-muted-foreground mt-1">{o.note}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        )}
      </section>

      {/* Holiday detail modal */}
      {activeHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setActiveHoliday(null)}>
          <div onClick={(e) => e.stopPropagation()} className="luxury-card max-w-lg w-full p-7 relative">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={() => setActiveHoliday(null)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <span className="luxury-eyebrow inline-flex">{activeHoliday.category}</span>
            <h3 className="luxury-menu-title text-3xl mt-3 mb-2">{activeHoliday.name}</h3>
            <div className="text-sm text-muted-foreground font-stencil tracking-wider">
              {new Date(activeHoliday.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <span className="luxury-gold-line block my-4" />
            <StatusDetail ov={overrideFor(activeHoliday.date)} />
            {(() => {
              const sp = specialFor(activeHoliday.key);
              return sp ? (
                <div className="mt-5">
                  <SpecialCard special={sp} />
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </SiteLayout>
  );
};

function StatusBadge({ ov }: { ov?: HoursOverride }) {
  if (!ov) return <span className="luxury-badge inline-flex items-center gap-1"><Store className="h-3 w-3" /> Open</span>;
  if (ov.status === "closed") return <span className="luxury-badge inline-flex items-center gap-1" style={{ color: "hsl(var(--bbq-ember))", borderColor: "hsl(var(--bbq-ember) / 0.6)" }}>Closed</span>;
  if (ov.status === "special_hours") return <span className="luxury-badge inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Special Hours</span>;
  return <span className="luxury-badge inline-flex items-center gap-1"><Store className="h-3 w-3" /> Open</span>;
}

function StatusDetail({ ov }: { ov?: HoursOverride }) {
  if (!ov) return <p className="text-sm text-muted-foreground">Regular business hours.</p>;
  return (
    <div className="text-sm space-y-2">
      <StatusBadge ov={ov} />
      {ov.status === "special_hours" && ov.open_time && ov.close_time && (
        <div className="text-foreground/80">
          {ov.open_time.slice(0, 5)} – {ov.close_time.slice(0, 5)}
        </div>
      )}
      {ov.note && <div className="text-muted-foreground">{ov.note}</div>}
    </div>
  );
}

export default HolidayCalendar;
