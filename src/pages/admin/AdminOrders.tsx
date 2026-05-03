import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, ShieldCheck, X as XIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/retina/OrderStatusBadge";

const STATUSES = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter as any);
    const { data } = await query;
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    fetchOrders();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl tracking-wider">Orders</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
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
                  <div className="font-display text-2xl text-primary">${Number(o.total).toFixed(2)}</div>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ul className="text-sm border-t border-border/50 pt-3 space-y-1.5">
                {o.order_items.map((i: any) => {
                  const opts = Array.isArray(i.selected_options) ? i.selected_options : [];
                  return (
                    <li key={i.id} className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <div>{i.quantity}× {i.item_name}</div>
                        {opts.length > 0 && (
                          <div className="text-[11px] text-muted-foreground pl-4">
                            {opts.map((o: any) => `${o.group}: ${o.name}`).join(" · ")}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
