import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useSpecials } from "@/hooks/useSpecials";
import { useHolidayEvents, type HolidayEvent } from "@/hooks/useHolidayEvents";
import { SpecialCard } from "@/components/specials/SpecialCard";
import { CalendarDays, Loader2, Clock, Store, X, ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK_LABELS = ["S","M","T","W","T","F","S"];

const HolidayCalendar = () => {
  const { events, loading } = useHolidayEvents();
  const { specials } = useSpecials({ activeOnly: true });
  const [active, setActive] = useState<HolidayEvent | null>(null);
  const [view, setView] = useState<"list" | "month">("list");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = useMemo(
    () => events.filter((e) => e.holiday_date >= today).slice(0, 12),
    [events, today],
  );
  const eventsByDate = useMemo(() => {
    const m: Record<string, HolidayEvent> = {};
    for (const e of events) m[e.holiday_date] = e;
    return m;
  }, [events]);

  const specialFor = (id: string | null) => (id ? specials.find((s) => s.id === id) : undefined);

  // Build month grid
  const monthGrid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: iso, day: d });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
    return cells;
  }, [cursor]);

  return (
    <SiteLayout>
      <Seo
        title="Holiday Hours & Calendar — Anderson's Smoking Que"
        description="Holiday hours, seasonal BBQ events, and special menus throughout the year."
        path="/holiday-calendar"
      />
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
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center rounded-full border border-gold/30 bg-background/40 p-1">
            <button
              onClick={() => setView("list")}
              className={`h-9 px-4 rounded-full font-stencil text-[10px] tracking-widest inline-flex items-center gap-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("month")}
              className={`h-9 px-4 rounded-full font-stencil text-[10px] tracking-widest inline-flex items-center gap-2 ${view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <CalendarIcon className="h-3.5 w-3.5" /> Month
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : view === "list" ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="luxury-menu-title text-3xl mb-2">Upcoming Holidays</h2>
            <span className="luxury-gold-line block mb-4" />
            {upcoming.length === 0 ? (
              <p className="luxury-subtitle">No upcoming holidays posted.</p>
            ) : upcoming.map((h) => (
              <button
                key={h.id}
                onClick={() => setActive(h)}
                className="luxury-card w-full p-5 text-left flex items-center gap-4"
              >
                <div className="w-16 shrink-0 text-center">
                  <div className="font-stencil text-[10px] text-gold tracking-widest uppercase">
                    {new Date(h.holiday_date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}
                  </div>
                  <div className="luxury-menu-title text-3xl leading-none">
                    {new Date(h.holiday_date + "T00:00:00").getDate()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="luxury-menu-title text-xl truncate">{h.holiday_name}</div>
                  {h.banner_title && (
                    <div className="text-xs text-muted-foreground font-stencil tracking-wider mt-1 truncate">{h.banner_title}</div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge status={h.business_status} />
                    {h.special_id && <span className="luxury-badge">Special Available</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto luxury-card p-5 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="h-9 w-9 rounded-full border border-gold/30 inline-flex items-center justify-center text-gold hover:bg-gold/5"
                aria-label="Previous month"
              ><ChevronLeft className="h-4 w-4" /></button>
              <div className="luxury-menu-title text-2xl md:text-3xl">{MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}</div>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="h-9 w-9 rounded-full border border-gold/30 inline-flex items-center justify-center text-gold hover:bg-gold/5"
                aria-label="Next month"
              ><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEK_LABELS.map((w, i) => (
                <div key={i} className="text-center font-stencil text-[10px] tracking-widest text-gold">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((c, i) => {
                const ev = c.date ? eventsByDate[c.date] : null;
                const isToday = c.date === today;
                return (
                  <button
                    key={i}
                    disabled={!ev}
                    onClick={() => ev && setActive(ev)}
                    className={`aspect-square rounded-lg text-left p-1.5 sm:p-2 border transition-colors ${
                      !c.date ? "border-transparent" :
                      ev ? "border-gold/40 bg-primary/10 hover:bg-primary/20" :
                      "border-border/40 bg-background/40"
                    } ${isToday ? "ring-1 ring-gold" : ""}`}
                  >
                    {c.day && (
                      <>
                        <div className={`font-stencil text-[11px] ${ev ? "text-gold" : "text-muted-foreground"}`}>{c.day}</div>
                        {ev && (
                          <div className="text-[9px] sm:text-[10px] leading-tight text-foreground/90 truncate mt-0.5">
                            {ev.holiday_name}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setActive(null)}>
          <div onClick={(e) => e.stopPropagation()} className="luxury-card max-w-lg w-full p-7 relative max-h-[90vh] overflow-auto">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={() => setActive(null)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <span className="luxury-eyebrow inline-flex">{active.holiday_type}</span>
            <h3 className="luxury-menu-title text-3xl mt-3 mb-2">{active.holiday_name}</h3>
            <div className="text-sm text-muted-foreground font-stencil tracking-wider">
              {new Date(active.holiday_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <span className="luxury-gold-line block my-4" />
            <StatusBadge status={active.business_status} />
            {active.business_status === "Special Hours" && active.open_time && active.close_time && (
              <div className="text-sm text-foreground/80 mt-2">
                {active.open_time.slice(0, 5)} – {active.close_time.slice(0, 5)}
              </div>
            )}
            {active.banner_title && <div className="luxury-menu-title text-lg mt-4">{active.banner_title}</div>}
            {active.banner_message && <p className="luxury-subtitle text-sm mt-1">{active.banner_message}</p>}
            {(() => {
              const sp = specialFor(active.special_id);
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

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (status === "Closed") return <span className="luxury-badge inline-flex items-center gap-1" style={{ color: "hsl(var(--bbq-ember))", borderColor: "hsl(var(--bbq-ember) / 0.6)" }}>Closed</span>;
  if (status === "Special Hours") return <span className="luxury-badge inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Special Hours</span>;
  return <span className="luxury-badge inline-flex items-center gap-1"><Store className="h-3 w-3" /> Open</span>;
}

export default HolidayCalendar;
