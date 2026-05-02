import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100),
  customer_email: z.string().trim().email("Invalid email").max(255),
  customer_phone: z.string().trim().min(7, "Phone is required").max(30),
  pickup_time: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const TAX_RATE = 0.07;

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: user?.email ?? "",
    customer_phone: "",
    pickup_time: "",
    notes: "",
  });

  const sub = subtotal();
  const tax = sub * TAX_RATE;
  const total = sub + tax;

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="container py-24 text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/40 mb-6" />
          <h1 className="font-display text-4xl mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Browse the menu and add some items to get started.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-12 px-8">
            <Link to="/menu">Browse Menu</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          customer_name: parsed.data.customer_name,
          customer_email: parsed.data.customer_email,
          customer_phone: parsed.data.customer_phone,
          pickup_time: parsed.data.pickup_time ? new Date(parsed.data.pickup_time).toISOString() : null,
          notes: parsed.data.notes || null,
          subtotal: sub,
          tax,
          total,
          status: "pending",
          payment_status: "unpaid",
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.id.endsWith("-alt") ? i.id.slice(0, -4) : i.id,
        item_name: i.name,
        unit_price: i.price,
        quantity: i.quantity,
        notes: i.notes ?? null,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed! We'll be in touch shortly.");
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container py-12 md:py-16 max-w-5xl">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-10">Review your order and provide pickup details.</p>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-card border border-border rounded-lg p-6 md:p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" type="tel" required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup">Preferred Pickup Time</Label>
              <Input id="pickup" type="datetime-local" value={form.pickup_time} onChange={(e) => setForm({ ...form, pickup_time: e.target.value })} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Special Requests</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Allergies, sauce on the side, etc." />
            </div>

            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
              <strong className="text-primary">Pay at pickup.</strong> We'll confirm your order by phone or email. 
              Online card payment is coming soon.
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-primary hover:bg-primary/90 font-stencil text-base shadow-ember"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : `Place Order — $${total.toFixed(2)}`}
            </Button>
          </form>

          <aside className="bg-charcoal-light border border-border rounded-lg p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-display text-2xl mb-4 tracking-wider">Order Summary</h2>
            <ul className="space-y-3 mb-6 max-h-72 overflow-auto pr-2">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between text-sm border-b border-border/40 pb-2">
                  <div>
                    <div className="font-stencil">{i.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                  </div>
                  <div className="text-foreground">${(i.price * i.quantity).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Tax (7%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-display tracking-wider pt-2">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Checkout;
