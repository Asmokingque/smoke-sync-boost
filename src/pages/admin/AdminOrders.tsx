import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, ShieldCheck, X as XIcon, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/retina/OrderStatusBadge";
import type { OrderStatus, OrderWithItems, SelectedOption } from "@/types/orders";

const STATUSES = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter as OrderStatus);
    const { data } = await query;
    setOrders((data ?? []) as OrderWithItems[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const q = search.trim().toLowerCase();
  const visibleOrders = q
    ? orders.filter((o) =>
        [o.order_number, o.customer_name, o.customer_email, o.customer_phone, o.id]
          .filter(Boolean)
          .some((v: string) => String(v).toLowerCase().includes(q))
      )
    : orders;

  const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
    );

  const printTicket = (o: OrderWithItems) => {
    const w = window.open("", "_blank", "width=420,height=640,noopener");
    if (!w) return toast.error("Allow pop-ups to print tickets.");
    try { (w as Window & { opener: unknown }).opener = null; } catch { /* noop */ }
    const items = (o.order_items ?? [])
      .map((i) => `<li>${esc(i.quantity)}× ${esc(i.item_name)} — $${(i.unit_price * i.quantity).toFixed(2)}</li>`)
      .join("");
    w.document.write(`<html><head><title>Order ${esc(o.order_number ?? o.id.slice(0, 8))}</title>
      <style>body{font-family:monospace;padding:16px}h1{font-size:18px}ul{padding-left:18px}</style></head>
      <body><h1>Anderson's Smoking Que</h1>
      <p>#${esc(o.order_number ?? o.id.slice(0, 8).toUpperCase())}<br/>${esc(new Date(o.created_at).toLocaleString())}</p>
      <p>${esc(o.customer_name)}<br/>${esc(o.customer_phone)}<br/>${esc(o.order_type ?? "pickup")}</p>
      <ul>${items}</ul>
      <p><strong>Total: $${Number(o.total).toFixed(2)}</strong></p>
      ${o.notes ? `<p>Note: ${esc(o.notes)}</p>` : ""}
      </body></html>`);
    w.document.close();
    w.print();
  };



  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as OrderStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    fetchOrders();
  };

  const updatePayment = async (id: string, payment_status: "paid" | "failed") => {
    const { error } = await supabase.from("orders").update({ payment_status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(payment_status === "paid" ? "Marked as paid" : "Marked as failed");
    fetchOrders();
  };

  const updateHeroes = async (
    o: OrderWithItems,
    patch: { status?: "verified" | "removed" | "pending_verification"; amount?: number }
  ) => {
    const newAmount = patch.status === "removed" ? 0 : patch.amount ?? Number(o.heroes_discount_amount ?? 0);
    const newStatus = patch.status ?? o.heroes_discount_status;
    const subtotal = Number(o.subtotal ?? 0);
    // Reconstruct prior promo discount from total reverse-engineering would be brittle.
    // We keep tax based on (subtotal - newAmount) as a simple, transparent recompute.
    const subAfter = Math.max(0, subtotal - newAmount);
    const tax = Math.round(subAfter * 0.07 * 100) / 100;
    const total = Math.round((subAfter + tax) * 100) / 100;
    const { error } = await supabase
      .from("orders")
      .update({
        heroes_discount_amount: newAmount,
        heroes_discount_status: newStatus,
        tax,
        total,
      })
      .eq("id", o.id);
    if (error) return toast.error(error.message);
    toast.success("Heroes discount updated");
    fetchOrders();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl tracking-wider">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, order #"
            className="h-10 w-64"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : visibleOrders.length === 0 ? (
        <p className="text-muted-foreground">No orders.</p>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((o) => (
            <div key={o.id} className="bg-gradient-card border border-border rounded-lg p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-3">
                <div>
                  <div className="font-stencil text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="font-display text-xl">{o.customer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {o.customer_phone} · {o.customer_email}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(o.created_at).toLocaleString()}
                    {o.pickup_time && <> · Pickup: {new Date(o.pickup_time).toLocaleString()}</>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <OrderStatusBadge status={o.status} />
                  {o.payment_status === "cod_pending" && (
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-2.5 py-1 font-stencil text-[10px] tracking-widest uppercase text-gold">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        Cash on Delivery (COD)
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[10px] font-stencil tracking-widest border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => updatePayment(o.id, "paid")}
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" /> Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[10px] font-stencil tracking-widest border-destructive/60 text-destructive hover:bg-destructive/10"
                          onClick={() => updatePayment(o.id, "failed")}
                        >
                          <XIcon className="h-3 w-3 mr-1" /> Mark Failed
                        </Button>
                      </div>
                    </div>
                  )}
                  {o.payment_status === "paid" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2.5 py-1 font-stencil text-[10px] tracking-widest uppercase text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Paid
                    </span>
                  )}
                  {o.payment_status === "failed" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/60 bg-destructive/10 px-2.5 py-1 font-stencil text-[10px] tracking-widest uppercase text-destructive">
                      <XIcon className="h-3 w-3" /> Payment Failed
                    </span>
                  )}
                  <div className="font-display text-2xl text-primary">${Number(o.total).toFixed(2)}</div>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8 text-[11px] font-stencil" onClick={() => printTicket(o)}>
                    <Printer className="h-3.5 w-3.5 mr-1" /> Print Ticket
                  </Button>
                </div>
              </div>
              <ul className="text-sm border-t border-border/50 pt-3 space-y-1.5">
                {o.order_items.map((i) => {
                  const opts: SelectedOption[] = Array.isArray(i.selected_options)
                    ? (i.selected_options as SelectedOption[])
                    : [];
                  return (
                    <li key={i.id} className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <div>{i.quantity}× {i.item_name}</div>
                        {opts.length > 0 && (
                          <div className="text-[11px] text-muted-foreground pl-4">
                            {opts.map((o) => `${o.group}: ${o.name}`).join(" · ")}
                          </div>
                        )}
                        {i.notes && (
                          <div className="text-[11px] italic text-muted-foreground/80 pl-4">Note: {i.notes}</div>
                        )}
                      </div>
                      <span className="text-muted-foreground shrink-0">${(i.unit_price * i.quantity).toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
              {o.notes && <div className="mt-3 text-xs text-muted-foreground italic">Note: {o.notes}</div>}
              {o.heroes_group && (
                <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-gold" />
                      <span className="font-stencil tracking-wider text-xs uppercase text-gold">Heroes Deal</span>
                      <span className="text-muted-foreground">· {o.heroes_group}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        o.heroes_discount_status === "verified"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                          : o.heroes_discount_status === "removed"
                          ? "border-destructive/40 text-destructive bg-destructive/10"
                          : "border-gold/40 text-gold bg-gold/5"
                      }`}>
                        {o.heroes_discount_status ?? "—"}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-400">−${Number(o.heroes_discount_amount ?? 0).toFixed(2)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" variant="outline" className="h-8 text-[11px] font-stencil"
                      onClick={() => updateHeroes(o, { status: "verified" })}>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verify
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-8 text-[11px] font-stencil text-destructive"
                      onClick={() => updateHeroes(o, { status: "removed" })}>
                      <XIcon className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-muted-foreground">Adjust $</span>
                      <Input type="number" min={0} step="0.01"
                        defaultValue={Number(o.heroes_discount_amount ?? 0)}
                        className="h-8 w-24 text-xs"
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isFinite(v) || v < 0) return;
                          if (v === Number(o.heroes_discount_amount ?? 0)) return;
                          updateHeroes(o, { amount: v, status: o.heroes_discount_status ?? "pending_verification" });
                        }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
