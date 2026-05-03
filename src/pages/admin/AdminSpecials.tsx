import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { FEDERAL_HOLIDAYS } from "@/lib/holidays";
import type { Special, SpecialType } from "@/lib/specials";
import { SPECIAL_TYPE_LABEL } from "@/lib/specials";

const TYPES: SpecialType[] = ["daily", "lunch", "holiday", "featured", "catering"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const blank = (): Partial<Special> => ({
  type: "daily",
  title: "",
  description: "",
  special_price: 0,
  regular_price: null,
  start_time: null,
  end_time: null,
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  is_active: true,
  sold_out: false,
  all_day_orderable: false,
  display_order: 0,
});

const AdminSpecials = () => {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Special> | null>(null);
  const [hours, setHours] = useState<any[]>([]);
  const [heroesSettings, setHeroesSettings] = useState<{ enabled: boolean; discount_percent: number }>({ enabled: true, discount_percent: 10 });

  const load = async () => {
    setLoading(true);
    const [s, h, b] = await Promise.all([
      supabase.from("specials").select("*").order("display_order"),
      supabase.from("business_hours_overrides").select("*").order("override_date"),
      supabase.from("business_settings").select("*").eq("setting_key", "community_heroes").maybeSingle(),
    ]);
    setSpecials((s.data ?? []) as unknown as Special[]);
    setHours(h.data ?? []);
    if (b.data) setHeroesSettings(b.data.setting_value as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveSpecial = async () => {
    if (!editing) return;
    const payload: any = { ...editing };
    if (payload.special_price === "" || payload.special_price == null) return toast.error("Price required");
    payload.special_price = Number(payload.special_price);
    if (payload.regular_price) payload.regular_price = Number(payload.regular_price);
    if (payload.id) {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("specials").update(rest).eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("specials").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const removeSpecial = async (id: string) => {
    if (!confirm("Delete this special?")) return;
    const { error } = await supabase.from("specials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleSoldOut = async (s: Special) => {
    await supabase.from("specials").update({ sold_out: !s.sold_out }).eq("id", s.id);
    load();
  };

  const saveHeroes = async () => {
    const { error } = await supabase
      .from("business_settings")
      .update({ setting_value: heroesSettings as any })
      .eq("setting_key", "community_heroes");
    if (error) return toast.error(error.message);
    toast.success("Heroes deal updated");
  };

  const addHourOverride = async () => {
    const date = prompt("Date (YYYY-MM-DD)?");
    if (!date) return;
    const status = prompt("Status: open / closed / special_hours", "closed") || "closed";
    const label = prompt("Label (e.g., Christmas Day)?", "") || null;
    const { error } = await supabase.from("business_hours_overrides").insert({ override_date: date, status: status as any, label });
    if (error) return toast.error(error.message);
    load();
  };

  const removeOverride = async (id: string) => {
    await supabase.from("business_hours_overrides").delete().eq("id", id);
    load();
  };

  const toggleWeekday = (d: number) => {
    if (!editing) return;
    const wd = new Set(editing.weekdays ?? []);
    wd.has(d) ? wd.delete(d) : wd.add(d);
    setEditing({ ...editing, weekdays: Array.from(wd).sort() });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl tracking-wider">Specials &amp; Calendar</h1>
        <Button onClick={() => setEditing(blank())} className="luxury-primary-btn h-10 font-stencil text-xs">
          <Plus className="h-4 w-4" /> New Special
        </Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
        <>
          {/* Specials list */}
          <section>
            <h2 className="font-display text-2xl mb-3">All Specials</h2>
            {specials.length === 0 ? (
              <p className="text-muted-foreground text-sm">No specials yet.</p>
            ) : (
              <div className="space-y-3">
                {specials.map((s) => (
                  <div key={s.id} className="luxury-card p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="luxury-badge">{SPECIAL_TYPE_LABEL[s.type]}</span>
                        {s.sold_out && <span className="luxury-badge" style={{ color: "hsl(var(--bbq-ember))" }}>Sold Out</span>}
                        {!s.is_active && <span className="luxury-badge">Hidden</span>}
                      </div>
                      <div className="font-display text-xl mt-1">{s.title}</div>
                      <div className="text-xs text-muted-foreground">${Number(s.special_price).toFixed(2)} · order #{s.display_order}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleSoldOut(s)}>{s.sold_out ? "Mark In Stock" : "Mark Sold Out"}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(s)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => removeSpecial(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Holiday hours overrides */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Holiday Hours &amp; Closures</h2>
              <Button onClick={addHourOverride} variant="outline" size="sm"><Plus className="h-4 w-4" /> Add Date</Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Federal holidays auto-populate the calendar. Add date overrides here to mark closures or special hours.</p>
            {hours.length === 0 ? (
              <p className="text-muted-foreground text-sm">No overrides yet.</p>
            ) : (
              <ul className="space-y-2">
                {hours.map((h) => {
                  const fed = FEDERAL_HOLIDAYS.find((f) => f.date === h.override_date);
                  return (
                    <li key={h.id} className="luxury-card p-4 flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-gold" />
                      <div className="flex-1 text-sm">
                        <div className="font-stencil text-xs uppercase tracking-wider">{h.override_date}</div>
                        <div>{h.label ?? fed?.name ?? "—"} · <span className="text-muted-foreground">{h.status}</span></div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeOverride(h.id)}><Trash2 className="h-4 w-4" /></Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Community Heroes */}
          <section className="luxury-card p-6 max-w-xl">
            <h2 className="font-display text-2xl mb-4">Community Heroes Deal</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enabled</Label>
                <Switch checked={heroesSettings.enabled} onCheckedChange={(v) => setHeroesSettings({ ...heroesSettings, enabled: v })} />
              </div>
              <div className="space-y-2">
                <Label>Discount Percent</Label>
                <Input type="number" min={0} max={100} value={heroesSettings.discount_percent} onChange={(e) => setHeroesSettings({ ...heroesSettings, discount_percent: Number(e.target.value) })} className="luxury-input h-11" />
              </div>
              <Button onClick={saveHeroes} className="luxury-primary-btn h-11 px-6 font-stencil text-xs">Save</Button>
            </div>
          </section>
        </>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur p-4 overflow-auto" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="luxury-card max-w-2xl w-full p-6 my-8">
            <h3 className="font-display text-2xl mb-4">{editing.id ? "Edit Special" : "New Special"}</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as SpecialType })}>
                    <SelectTrigger className="luxury-input h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{SPECIAL_TYPE_LABEL[t]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} className="luxury-input h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="luxury-input h-11" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="luxury-input" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Special Price *</Label>
                  <Input type="number" step="0.01" value={editing.special_price ?? 0} onChange={(e) => setEditing({ ...editing, special_price: Number(e.target.value) })} className="luxury-input h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Regular Price</Label>
                  <Input type="number" step="0.01" value={editing.regular_price ?? ""} onChange={(e) => setEditing({ ...editing, regular_price: e.target.value === "" ? null : Number(e.target.value) })} className="luxury-input h-11" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={editing.start_time ?? ""} onChange={(e) => setEditing({ ...editing, start_time: e.target.value || null })} className="luxury-input h-11" />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={editing.end_time ?? ""} onChange={(e) => setEditing({ ...editing, end_time: e.target.value || null })} className="luxury-input h-11" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Available From</Label>
                  <Input type="date" value={editing.available_from ?? ""} onChange={(e) => setEditing({ ...editing, available_from: e.target.value || null })} className="luxury-input h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Available Until</Label>
                  <Input type="date" value={editing.available_until ?? ""} onChange={(e) => setEditing({ ...editing, available_until: e.target.value || null })} className="luxury-input h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weekdays</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d, i) => {
                    const on = (editing.weekdays ?? []).includes(i);
                    return (
                      <button key={i} type="button" onClick={() => toggleWeekday(i)} className={`px-3 h-9 rounded-full font-stencil text-xs border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70"}`}>{d}</button>
                    );
                  })}
                </div>
              </div>
              {editing.type === "holiday" && (
                <div className="space-y-2">
                  <Label>Linked Holiday</Label>
                  <Select value={editing.holiday_key ?? ""} onValueChange={(v) => setEditing({ ...editing, holiday_key: v || null })}>
                    <SelectTrigger className="luxury-input h-11"><SelectValue placeholder="Select holiday" /></SelectTrigger>
                    <SelectContent>
                      {FEDERAL_HOLIDAYS.map((h) => <SelectItem key={h.key} value={h.key}>{h.name} · {h.date}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />Active</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.sold_out ?? false} onCheckedChange={(v) => setEditing({ ...editing, sold_out: v })} />Sold Out</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.all_day_orderable ?? false} onCheckedChange={(v) => setEditing({ ...editing, all_day_orderable: v })} />All-day orderable</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveSpecial} className="luxury-primary-btn h-10 px-6 font-stencil text-xs">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecials;
