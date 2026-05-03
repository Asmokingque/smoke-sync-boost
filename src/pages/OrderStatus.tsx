import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  order_number: string | null;
  status: string;
  payment_status: string;
  order_type: string;
  pickup_time: string | null;
  delivery_address: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  created_at: string;
};

type Item = {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes: string | null;
};

const OrderStatus = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) {
      toast.error("Enter your order number and email or phone.");
      return;
    }
    setLoading(true);
    setOrder(null);
    setItems([]);
    try {
      const c = contact.trim();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber.trim().toUpperCase())
        .or(`customer_email.eq.${c},customer_phone.eq.${c}`)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast.error("No matching order found. Double-check the number and contact info.");
        return;
      }
      setOrder(data as Order);
      const { data: it } = await supabase
        .from("order_items")
        .select("id, item_name, quantity, unit_price, line_total, notes")
        .eq("order_id", data.id);
      setItems((it ?? []) as Item[]);
    } catch (err: any) {
      toast.error(err.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">Track Your Order</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4">Order Status</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enter your order number and the email or phone you placed it with.
          </p>
        </div>
      </section>

      <section className="container py-12 max-w-2xl">
        <form onSubmit={lookup} className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ordernum">Order Number</Label>
            <Input
              id="ordernum"
              placeholder="ASQ-XXXXXX-XXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="h-12 font-stencil tracking-wider"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Email or Phone</Label>
            <Input
              id="contact"
              placeholder="you@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="h-12"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Look Up Order</>}
          </Button>
        </form>

        {order && (
          <div className="mt-8 bg-charcoal-light border border-border rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-stencil text-xs text-muted-foreground">Order</div>
                <div className="font-display text-2xl text-primary tracking-wider">{order.order_number}</div>
              </div>
              <div className="text-right">
                <div className="font-stencil text-xs text-muted-foreground">Total</div>
                <div className="font-display text-2xl">${Number(order.total).toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Status" value={order.status} highlight />
              <Stat label="Payment" value={order.payment_status} />
              <Stat label="Type" value={order.order_type} />
              <Stat
                label={order.order_type === "Delivery" ? "Address" : "Pickup"}
                value={order.order_type === "Delivery"
                  ? (order.delivery_address ?? "—")
                  : (order.pickup_time ? new Date(order.pickup_time).toLocaleString() : "ASAP")}
              />
            </div>

            <div className="border-t border-border pt-4">
              <h2 className="font-stencil text-sm text-primary mb-3">Items</h2>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between text-sm border-b border-border/40 pb-2">
                    <span>
                      <span className="font-stencil">{it.quantity}×</span> {it.item_name}
                      {it.notes && <span className="block text-xs italic text-muted-foreground">Note: {it.notes}</span>}
                    </span>
                    <span className="font-display text-primary">${Number(it.line_total).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-background/40 border border-border rounded-md p-3">
      <div className="font-stencil text-[10px] text-muted-foreground tracking-wider">{label}</div>
      <div className={`font-stencil text-sm mt-1 ${highlight ? "text-primary" : "text-foreground"} capitalize`}>
        {value.replace(/_/g, " ")}
      </div>
    </div>
  );
}

export default OrderStatus;
