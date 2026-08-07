import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Calendar as CalendarIcon, ArrowUp, ArrowDown, Eye, EyeOff, Package, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import type { Special, SpecialType } from "@/lib/specials";
import { SPECIAL_TYPE_LABEL } from "@/lib/specials";

const TYPES: SpecialType[] = ["daily", "lunch", "holiday", "featured", "catering"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOLIDAY_STATUSES = ["Open", "Closed", "Special Hours"] as const;

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

type HolidayEvt = {
  id: string;
  holiday_name: string;
  holiday_date: string;
  holiday_type: string;
  business_status: string | null;
  open_time: string | null;
  close_time: string | null;
  banner_title: string | null;
  banner_message: string | null;
  special_id: string | null;
  is_active: boolean;
  display_order: number;
};

type CommunityDisc = {
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

type AdminSpecialsFocus = "all" | "lunch" | "holiday";

const AdminSpecials = ({ focus = "all" }: { focus?: AdminSpecialsFocus }) => {
  const { isSuperAdmin } = useAdminAuth();
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Special> | null>(null);
  const [holidays, setHolidays] = useState<HolidayEvt[]>([]);
  const [editingHoliday, setEditingHoliday] = useState<Partial<HolidayEvt> | null>(null);
  const [discounts, setDiscounts] = useState<CommunityDisc[]>([]);
  const [editingDiscount, setEditingDiscount] = useState<Partial<CommunityDisc> | null>(null);
  const [discountOrders, setDiscountOrders] = useState<any[]>([]);

  // Items management state (only relevant when editing an existing special)
  const [items, setItems] = useState<SpecialItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SpecialItem> | null>(null);
  const [menuItems, setMenuItems] = useState<{ id: string; name: string; price: number | null }[]>([]);

  const load = async () => {
    setLoading(true);
    const [s, he, cd, m, ord] = await Promise.all([
      supabase.from("specials").select("*").order("display_order"),
      supabase.from("holiday_events").select("*").order("holiday_date"),
      supabase.from("community_discounts").select("*").order("created_at"),
      supabase.from("menu_items").select("id,name,price").order("name"),
      supabase.from("orders").select("id,order_number,customer_name,created_at,total,discount_name,discount_amount,discount_status,community_group").not("discount_id", "is", null).order("created_at", { ascending: false }).limit(50),
    ]);
    setSpecials((s.data ?? []) as unknown as Special[]);
    setHolidays(((he.data ?? []) as unknown) as HolidayEvt[]);
    const ds = ((cd.data ?? []) as any[]).map((d) => ({
      ...d,
      eligible_groups: Array.isArray(d.eligible_groups) ? d.eligible_groups : [],
    })) as CommunityDisc[];
    setDiscounts(ds);
    setMenuItems((m.data ?? []) as any);
    setDiscountOrders((ord.data ?? []) as any[]);
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

  // Holiday events CRUD
  const blankHoliday = (): Partial<HolidayEvt> => ({
    holiday_name: "",
    holiday_date: new Date().toISOString().slice(0, 10),
    holiday_type: "custom",
    business_status: "Open",
    is_active: true,
    display_order: holidays.length,
  });

  const saveHoliday = async () => {
    if (!editingHoliday) return;
    if (!editingHoliday.holiday_name?.trim()) return toast.error("Name required");
    if (!editingHoliday.holiday_date) return toast.error("Date required");
    const payload: any = { ...editingHoliday };
    if (payload.id) {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("holiday_events").update(rest).eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("holiday_events").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Holiday saved");
    setEditingHoliday(null);
    load();
  };

  const removeHoliday = async (id: string) => {
    if (!confirm("Delete this holiday?")) return;
    await supabase.from("holiday_events").delete().eq("id", id);
    load();
  };

  // Community discount CRUD
  const blankDiscount = (): Partial<CommunityDisc> => ({
    title: "Community Heroes Deal",
    description: "",
    eligible_groups: ["Law Enforcement", "Firefighter", "Teacher", "Veteran"],
    discount_type: "percentage",
    discount_value: 10,
    min_subtotal: 0,
    max_discount: null,
    requires_id_verification: true,
    allow_online_selection: true,
    is_active: true,
    terms: "Valid ID may be required at pickup or delivery. Discount may be adjusted if eligibility cannot be verified.",
  });

  const saveDiscount = async () => {
    if (!editingDiscount) return;
    if (!editingDiscount.title?.trim()) return toast.error("Title required");
    const payload: any = {
      ...editingDiscount,
      eligible_groups: editingDiscount.eligible_groups ?? [],
      discount_value: Number(editingDiscount.discount_value ?? 0),
      min_subtotal: editingDiscount.min_subtotal == null ? 0 : Number(editingDiscount.min_subtotal),
      max_discount: editingDiscount.max_discount == null || (editingDiscount.max_discount as any) === "" ? null : Number(editingDiscount.max_discount),
    };
    if (payload.id) {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("community_discounts").update(rest).eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("community_discounts").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Discount saved");
    setEditingDiscount(null);
    load();
  };

  const removeDiscount = async (id: string) => {
    if (!confirm("Delete this discount?")) return;
    await supabase.from("community_discounts").delete().eq("id", id);
    load();
  };

  const toggleDiscountActive = async (d: CommunityDisc) => {
    await supabase.from("community_discounts").update({ is_active: !d.is_active }).eq("id", d.id);
    load();
  };

  const verifyDiscountOrder = async (orderId: string, status: "Verified" | "Removed") => {
    const patch: any = { discount_status: status };
    if (status === "Removed") patch.discount_amount = 0;
    const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
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

  const visibleSpecials = focus === "lunch" ? specials.filter((s) => s.type === "lunch") : specials;
  const pageTitle =
    focus === "lunch" ? "Lunch Specials" : focus === "holiday" ? "Holiday Calendar" : "Specials & Calendar";

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl tracking-wider">{pageTitle}</h1>
        {focus !== "holiday" && (
          <Button
            onClick={() => setEditing({ ...blank(), type: focus === "lunch" ? "lunch" : "daily" })}
            className="luxury-primary-btn h-10 font-stencil text-xs"
          >
            <Plus className="h-4 w-4" /> New Special
          </Button>
        )}
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
        <>
          {/* Specials list */}
          {focus !== "holiday" && (
          <section>
            <h2 className="font-display text-2xl mb-3">{focus === "lunch" ? "Lunch Specials" : "All Specials"}</h2>
            {visibleSpecials.length === 0 ? (
              <p className="text-muted-foreground text-sm">No specials yet.</p>
            ) : (
              <div className="space-y-3">
                {[...visibleSpecials].sort((a, b) => a.display_order - b.display_order).map((s, i, arr) => (
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
                      {isSuperAdmin && <Button size="sm" variant="ghost" onClick={() => removeSpecial(s.id)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* Holiday Events */}
          {focus !== "lunch" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Holiday Calendar</h2>
              <Button onClick={() => setEditingHoliday(blankHoliday())} variant="outline" size="sm"><Plus className="h-4 w-4" /> Add Holiday</Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Federal + custom holidays. Mark business open/closed/special hours and link a holiday special.</p>
            {holidays.length === 0 ? (
              <p className="text-muted-foreground text-sm">No holidays yet.</p>
            ) : (
              <ul className="space-y-2">
                {holidays.map((h) => {
                  const linked = specials.find((s) => s.id === h.special_id);
                  return (
                    <li key={h.id} className="luxury-card p-4 flex flex-wrap items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-gold" />
                      <div className="flex-1 min-w-[200px] text-sm">
                        <div className="font-stencil text-xs uppercase tracking-wider text-gold">{h.holiday_date}</div>
                        <div className="font-display text-lg">{h.holiday_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {h.business_status ?? "Open"}
                          {linked && <> · Linked: {linked.title}</>}
                          {!h.is_active && " · Hidden"}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setEditingHoliday(h)}>Edit</Button>
                      {isSuperAdmin && <Button size="sm" variant="ghost" onClick={() => removeHoliday(h.id)}><Trash2 className="h-4 w-4" /></Button>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          )}

          {/* Community Discounts */}
          {focus === "all" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl flex items-center gap-2"><Heart className="h-5 w-5 text-gold" /> Community Heroes Deals</h2>
              <Button onClick={() => setEditingDiscount(blankDiscount())} variant="outline" size="sm"><Plus className="h-4 w-4" /> Add Deal</Button>
            </div>
            {discounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No community discounts yet.</p>
            ) : (
              <ul className="space-y-2">
                {discounts.map((d) => (
                  <li key={d.id} className="luxury-card p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-lg">{d.title}</span>
                        {!d.is_active && <span className="luxury-badge">Disabled</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {d.discount_type === "percentage" ? `${d.discount_value}% off` : `$${d.discount_value} off`}
                        {d.max_discount ? ` · max $${d.max_discount}` : ""}
                        {d.min_subtotal ? ` · min $${d.min_subtotal}` : ""}
                        {" · "}{d.eligible_groups.join(", ")}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleDiscountActive(d)}>
                      {d.is_active ? <><EyeOff className="h-3.5 w-3.5 mr-1" />Disable</> : <><Eye className="h-3.5 w-3.5 mr-1" />Enable</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingDiscount(d)}>Edit</Button>
                    {isSuperAdmin && <Button size="sm" variant="ghost" onClick={() => removeDiscount(d.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </li>
                ))}
              </ul>
            )}
          </section>
          )}

          {/* Discount orders */}
          {focus === "all" && (
          <section>
            <h2 className="font-display text-2xl mb-3">Recent Orders Using a Discount</h2>
            {discountOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders with discounts yet.</p>
            ) : (
              <ul className="space-y-2">
                {discountOrders.map((o) => (
                  <li key={o.id} className="luxury-card p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[220px] text-sm">
                      <div className="font-stencil text-xs text-muted-foreground">#{o.order_number ?? o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleString()}</div>
                      <div className="font-display text-lg">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.discount_name} · {o.community_group} · −${Number(o.discount_amount ?? 0).toFixed(2)} · Total ${Number(o.total).toFixed(2)}
                      </div>
                    </div>
                    <span className={`luxury-badge ${o.discount_status === "Verified" ? "" : ""}`}>{o.discount_status ?? "—"}</span>
                    <Button size="sm" variant="outline" onClick={() => verifyDiscountOrder(o.id, "Verified")}>Verify</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => verifyDiscountOrder(o.id, "Removed")}>Remove</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          )}
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
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUploader
                  value={editing.image_url ?? ""}
                  onChange={(url) => setEditing({ ...editing, image_url: url })}
                  bucket="specials-images"
                  label="Special photo"
                  special={{ type: editing.type ?? "featured", slug: editing.title ?? "special" }}
                />
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
                      {holidays.map((h) => <SelectItem key={h.id} value={h.id}>{h.holiday_name} · {h.holiday_date}</SelectItem>)}
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
                          {isSuperAdmin && <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4" /></Button>}
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

      {/* Holiday editor */}
      {editingHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur p-4 overflow-auto" onClick={() => setEditingHoliday(null)}>
          <div onClick={(e) => e.stopPropagation()} className="luxury-card max-w-xl w-full p-6 my-8 space-y-3">
            <h3 className="font-display text-2xl mb-2">{editingHoliday.id ? "Edit Holiday" : "New Holiday"}</h3>
            <div className="space-y-2"><Label>Name *</Label><Input value={editingHoliday.holiday_name ?? ""} onChange={(e) => setEditingHoliday({ ...editingHoliday, holiday_name: e.target.value })} className="luxury-input h-11" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={editingHoliday.holiday_date ?? ""} onChange={(e) => setEditingHoliday({ ...editingHoliday, holiday_date: e.target.value })} className="luxury-input h-11" /></div>
              <div className="space-y-2"><Label>Type</Label>
                <Select value={editingHoliday.holiday_type ?? "custom"} onValueChange={(v) => setEditingHoliday({ ...editingHoliday, holiday_type: v })}>
                  <SelectTrigger className="luxury-input h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Business Status</Label>
              <Select value={editingHoliday.business_status ?? "Open"} onValueChange={(v) => setEditingHoliday({ ...editingHoliday, business_status: v })}>
                <SelectTrigger className="luxury-input h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{HOLIDAY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {editingHoliday.business_status === "Special Hours" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Open</Label><Input type="time" value={editingHoliday.open_time ?? ""} onChange={(e) => setEditingHoliday({ ...editingHoliday, open_time: e.target.value || null })} className="luxury-input h-11" /></div>
                <div className="space-y-2"><Label>Close</Label><Input type="time" value={editingHoliday.close_time ?? ""} onChange={(e) => setEditingHoliday({ ...editingHoliday, close_time: e.target.value || null })} className="luxury-input h-11" /></div>
              </div>
            )}
            <div className="space-y-2"><Label>Banner Title</Label><Input value={editingHoliday.banner_title ?? ""} onChange={(e) => setEditingHoliday({ ...editingHoliday, banner_title: e.target.value })} className="luxury-input h-11" /></div>
            <div className="space-y-2"><Label>Banner Message</Label><Textarea rows={2} value={editingHoliday.banner_message ?? ""} onChange={(e) => setEditingHoliday({ ...editingHoliday, banner_message: e.target.value })} className="luxury-input" /></div>
            <div className="space-y-2"><Label>Linked Special</Label>
              <Select value={editingHoliday.special_id ?? "__none"} onValueChange={(v) => setEditingHoliday({ ...editingHoliday, special_id: v === "__none" ? null : v })}>
                <SelectTrigger className="luxury-input h-11"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None</SelectItem>
                  {specials.filter((s) => s.type === "holiday").map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={editingHoliday.is_active ?? true} onCheckedChange={(v) => setEditingHoliday({ ...editingHoliday, is_active: v })} />Active</label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingHoliday(null)}>Cancel</Button>
              <Button onClick={saveHoliday} className="luxury-primary-btn h-10 px-6 font-stencil text-xs">Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Community Discount editor */}
      {editingDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur p-4 overflow-auto" onClick={() => setEditingDiscount(null)}>
          <div onClick={(e) => e.stopPropagation()} className="luxury-card max-w-xl w-full p-6 my-8 space-y-3">
            <h3 className="font-display text-2xl mb-2">{editingDiscount.id ? "Edit Deal" : "New Deal"}</h3>
            <div className="space-y-2"><Label>Title *</Label><Input value={editingDiscount.title ?? ""} onChange={(e) => setEditingDiscount({ ...editingDiscount, title: e.target.value })} className="luxury-input h-11" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={editingDiscount.description ?? ""} onChange={(e) => setEditingDiscount({ ...editingDiscount, description: e.target.value })} className="luxury-input" /></div>
            <div className="space-y-2"><Label>Eligible Groups (comma-separated)</Label>
              <Input value={(editingDiscount.eligible_groups ?? []).join(", ")} onChange={(e) => setEditingDiscount({ ...editingDiscount, eligible_groups: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="luxury-input h-11" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Type</Label>
                <Select value={editingDiscount.discount_type ?? "percentage"} onValueChange={(v) => setEditingDiscount({ ...editingDiscount, discount_type: v as any })}>
                  <SelectTrigger className="luxury-input h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed $</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Value *</Label><Input type="number" step="0.01" value={editingDiscount.discount_value ?? 0} onChange={(e) => setEditingDiscount({ ...editingDiscount, discount_value: Number(e.target.value) })} className="luxury-input h-11" /></div>
              <div className="space-y-2"><Label>Max $</Label><Input type="number" step="0.01" value={editingDiscount.max_discount ?? ""} onChange={(e) => setEditingDiscount({ ...editingDiscount, max_discount: e.target.value === "" ? null : Number(e.target.value) })} className="luxury-input h-11" /></div>
            </div>
            <div className="space-y-2"><Label>Min Subtotal $</Label><Input type="number" step="0.01" value={editingDiscount.min_subtotal ?? 0} onChange={(e) => setEditingDiscount({ ...editingDiscount, min_subtotal: Number(e.target.value) })} className="luxury-input h-11" /></div>
            <div className="space-y-2"><Label>Terms</Label><Textarea rows={2} value={editingDiscount.terms ?? ""} onChange={(e) => setEditingDiscount({ ...editingDiscount, terms: e.target.value })} className="luxury-input" /></div>
            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 text-sm"><Switch checked={editingDiscount.is_active ?? true} onCheckedChange={(v) => setEditingDiscount({ ...editingDiscount, is_active: v })} />Active</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={editingDiscount.allow_online_selection ?? true} onCheckedChange={(v) => setEditingDiscount({ ...editingDiscount, allow_online_selection: v })} />Allow online selection</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={editingDiscount.requires_id_verification ?? true} onCheckedChange={(v) => setEditingDiscount({ ...editingDiscount, requires_id_verification: v })} />Requires ID</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingDiscount(null)}>Cancel</Button>
              <Button onClick={saveDiscount} className="luxury-primary-btn h-10 px-6 font-stencil text-xs">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecials;
