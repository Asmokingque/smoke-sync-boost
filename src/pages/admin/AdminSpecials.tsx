import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Calendar as CalendarIcon, ArrowUp, ArrowDown, Eye, EyeOff, Package } from "lucide-react";
import { toast } from "sonner";
import { FEDERAL_HOLIDAYS } from "@/lib/holidays";
import type { Special, SpecialType } from "@/lib/specials";
import { SPECIAL_TYPE_LABEL } from "@/lib/specials";

const TYPES: SpecialType[] = ["daily", "lunch", "holiday", "featured", "catering"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SpecialItem = {
  id: string;
  special_id: string;
  menu_item_id: string | null;
  item_name: string;
  description: string | null;
  regular_price: number | null;
  special_price: number;
  included_sides: number;
  is_active: boolean;
  display_order: number;
};

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

const blankItem = (special_id: string, order: number): Partial<SpecialItem> => ({
  special_id,
  item_name: "",
  description: "",
  special_price: 0,
  regular_price: null,
  included_sides: 0,
  is_active: true,
  display_order: order,
  menu_item_id: null,
});

const AdminSpecials = () => {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Special> | null>(null);
  const [hours, setHours] = useState<any[]>([]);
  const [heroesSettings, setHeroesSettings] = useState<{ enabled: boolean; discount_percent: number }>({ enabled: true, discount_percent: 10 });

  // Items management state (only relevant when editing an existing special)
  const [items, setItems] = useState<SpecialItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SpecialItem> | null>(null);
  const [menuItems, setMenuItems] = useState<{ id: string; name: string; price: number | null }[]>([]);

  const load = async () => {
    setLoading(true);
    const [s, h, b, m] = await Promise.all([
      supabase.from("specials").select("*").order("display_order"),
      supabase.from("business_hours_overrides").select("*").order("override_date"),
      supabase.from("business_settings").select("*").eq("setting_key", "community_heroes").maybeSingle(),
      supabase.from("menu_items").select("id,name,price").order("name"),
    ]);
    setSpecials((s.data ?? []) as unknown as Special[]);
    setHours(h.data ?? []);
    if (b.data) setHeroesSettings(b.data.setting_value as any);
    setMenuItems((m.data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadItems = async (specialId: string) => {
    setItemsLoading(true);
    const { data, error } = await supabase
      .from("special_items" as any)
      .select("*")
      .eq("special_id", specialId)
      .order("display_order");
    if (error) toast.error(error.message);
    setItems(((data as any) ?? []) as SpecialItem[]);
    setItemsLoading(false);
  };

  useEffect(() => {
    if (editing?.id) loadItems(editing.id);
    else setItems([]);
  }, [editing?.id]);

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

  const toggleActive = async (s: Special) => {
    await supabase.from("specials").update({ is_active: !s.is_active }).eq("id", s.id);
    load();
  };

  const reorderSpecial = async (s: Special, dir: -1 | 1) => {
    const sorted = [...specials].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((x) => x.id === s.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from("specials").update({ display_order: other.display_order }).eq("id", s.id),
      supabase.from("specials").update({ display_order: s.display_order }).eq("id", other.id),
    ]);
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

  // Items handlers
  const saveItem = async () => {
    if (!editingItem || !editing?.id) return;
    if (!editingItem.item_name?.trim()) return toast.error("Item name required");
    if (editingItem.special_price == null || isNaN(Number(editingItem.special_price))) return toast.error("Price required");
    const payload: any = {
      ...editingItem,
      special_id: editing.id,
      special_price: Number(editingItem.special_price),
      regular_price: editingItem.regular_price == null || (editingItem.regular_price as any) === "" ? null : Number(editingItem.regular_price),
      included_sides: Number(editingItem.included_sides ?? 0),
    };
    if (payload.id) {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("special_items" as any).update(rest).eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("special_items" as any).insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Item saved");
    setEditingItem(null);
    loadItems(editing.id);
  };

  const removeItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("special_items" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (editing?.id) loadItems(editing.id);
  };

  const toggleItemActive = async (it: SpecialItem) => {
    await supabase.from("special_items" as any).update({ is_active: !it.is_active }).eq("id", it.id);
    if (editing?.id) loadItems(editing.id);
  };

  const reorderItem = async (it: SpecialItem, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((x) => x.id === it.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from("special_items" as any).update({ display_order: other.display_order }).eq("id", it.id),
      supabase.from("special_items" as any).update({ display_order: it.display_order }).eq("id", other.id),
    ]);
    if (editing?.id) loadItems(editing.id);
  };

  const onPickMenuItem = (menuId: string) => {
    if (!editingItem) return;
    if (!menuId) {
      setEditingItem({ ...editingItem, menu_item_id: null });
      return;
    }
    const m = menuItems.find((x) => x.id === menuId);
    if (!m) return;
    setEditingItem({
      ...editingItem,
      menu_item_id: m.id,
      item_name: editingItem.item_name || m.name,
      regular_price: m.price ?? editingItem.regular_price ?? null,
    });
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
                {[...specials].sort((a, b) => a.display_order - b.display_order).map((s, i, arr) => (
                  <div key={s.id} className="luxury-card p-5 flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0} onClick={() => reorderSpecial(s, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === arr.length - 1} onClick={() => reorderSpecial(s, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="luxury-badge">{SPECIAL_TYPE_LABEL[s.type]}</span>
                        {s.sold_out && <span className="luxury-badge" style={{ color: "hsl(var(--bbq-ember))" }}>Sold Out</span>}
                        {!s.is_active && <span className="luxury-badge">Hidden</span>}
                      </div>
                      <div className="font-display text-xl mt-1">{s.title}</div>
                      <div className="text-xs text-muted-foreground">${Number(s.special_price).toFixed(2)} · order #{s.display_order}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>
                        {s.is_active ? <><EyeOff className="h-3.5 w-3.5 mr-1" />Hide</> : <><Eye className="h-3.5 w-3.5 mr-1" />Show</>}
                      </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur p-4 overflow-auto" onClick={() => { setEditing(null); setEditingItem(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="luxury-card max-w-3xl w-full p-6 my-8">
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
              <div className="flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />Active</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.sold_out ?? false} onCheckedChange={(v) => setEditing({ ...editing, sold_out: v })} />Sold Out</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.all_day_orderable ?? false} onCheckedChange={(v) => setEditing({ ...editing, all_day_orderable: v })} />All-day orderable</label>
              </div>
            </div>

            {/* Special items management */}
            {editing.id && (
              <div className="mt-8 border-t border-gold/20 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-xl flex items-center gap-2"><Package className="h-4 w-4 text-gold" />Special Items</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingItem(blankItem(editing.id!, items.length))}
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Add line items included in this special (e.g. ribs + 2 sides + drink). Optionally link to an existing menu item.</p>

                {itemsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : items.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No items yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {[...items].sort((a, b) => a.display_order - b.display_order).map((it, i, arr) => (
                      <li key={it.id} className="rounded-md border border-border/60 bg-background/40 p-3 flex flex-wrap items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => reorderItem(it, -1)}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === arr.length - 1} onClick={() => reorderItem(it, 1)}>
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-stencil text-sm">{it.item_name}</span>
                            {!it.is_active && <span className="luxury-badge">Hidden</span>}
                            {it.included_sides > 0 && <span className="text-[11px] text-muted-foreground">+{it.included_sides} sides</span>}
                          </div>
                          {it.description && <div className="text-xs text-muted-foreground">{it.description}</div>}
                          <div className="text-xs text-gold mt-0.5">
                            ${Number(it.special_price).toFixed(2)}
                            {it.regular_price ? <span className="text-muted-foreground line-through ml-2">${Number(it.regular_price).toFixed(2)}</span> : null}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => toggleItemActive(it)}>
                            {it.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(it)}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Item editor */}
                {editingItem && (
                  <div className="mt-4 rounded-lg border border-gold/30 bg-background/40 p-4 space-y-3">
                    <div className="font-stencil text-xs uppercase tracking-wider text-gold">{editingItem.id ? "Edit Item" : "New Item"}</div>
                    <div className="space-y-2">
                      <Label>Link Menu Item (optional)</Label>
                      <Select value={editingItem.menu_item_id ?? "__none"} onValueChange={(v) => onPickMenuItem(v === "__none" ? "" : v)}>
                        <SelectTrigger className="luxury-input h-10"><SelectValue placeholder="Standalone" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Standalone (no link)</SelectItem>
                          {menuItems.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Item Name *</Label>
                      <Input value={editingItem.item_name ?? ""} onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })} className="luxury-input h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea rows={2} value={editingItem.description ?? ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="luxury-input" />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Special Price *</Label>
                        <Input type="number" step="0.01" value={editingItem.special_price ?? 0} onChange={(e) => setEditingItem({ ...editingItem, special_price: Number(e.target.value) })} className="luxury-input h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Regular Price</Label>
                        <Input type="number" step="0.01" value={editingItem.regular_price ?? ""} onChange={(e) => setEditingItem({ ...editingItem, regular_price: e.target.value === "" ? null : Number(e.target.value) })} className="luxury-input h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Included Sides</Label>
                        <Input type="number" min={0} value={editingItem.included_sides ?? 0} onChange={(e) => setEditingItem({ ...editingItem, included_sides: Number(e.target.value) })} className="luxury-input h-10" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={editingItem.is_active ?? true} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_active: v })} />Active
                    </label>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
                      <Button onClick={saveItem} className="luxury-primary-btn h-9 px-4 font-stencil text-xs">Save Item</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!editing.id && (
              <p className="mt-6 text-xs text-muted-foreground italic">Save the special first to add line items.</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => { setEditing(null); setEditingItem(null); }}>Close</Button>
              <Button onClick={saveSpecial} className="luxury-primary-btn h-10 px-6 font-stencil text-xs">Save Special</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecials;
