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
import { Loader2, ShoppingBag, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { computeDiscount, buildSafeOrderTotals, type Promo } from "@/lib/promo";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100),
  customer_email: z.string().trim().email("Invalid email").max(255),
  customer_phone: z.string().trim().min(7, "Phone is required").max(30),
  pickup_time: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const TAX_RATE = 0.07;

const PROMOS: Promo[] = [
  { code: "SMOKE10", label: "10% off", type: "percent", value: 0.1 },
  { code: "BBQ20", label: "20% off", type: "percent", value: 0.2 },
  { code: "PITMASTER5", label: "$5 off order", type: "fixed", value: 5 },
];

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: user?.email ?? "",
    customer_phone: "",
    pickup_time: "",
    notes: "",
  });

  const breakdown = computeDiscount(
    items.map((i) => ({ price: i.price, quantity: i.quantity })),
    promo
  );
  const sub = breakdown.sub;
  const discountAmount = breakdown.discountAmount;
  const discountedSub = breakdown.discountedSub;
  const discountRate = promo?.type === "percent" ? Math.min(Math.max(promo.value, 0), 1) : 0;
  const tax = Math.max(0, discountedSub * TAX_RATE);
  const total = Math.max(0, discountedSub + tax);

  // Dev-time invariant assertion (non-production safety net).
  if (import.meta.env.DEV) {
    const summed = breakdown.lines.reduce((s, l) => s + l.lineDiscount, 0);
    const drift = Math.abs(summed - discountAmount);
    if (drift > 0.01) {
      // eslint-disable-next-line no-console
      console.error("[promo] line discount sum mismatch", { summed, discountAmount, drift });
    }
    for (const l of breakdown.lines) {
      if (l.lineAfter < 0 || l.lineDiscount < 0 || l.lineDiscount > l.lineTotal) {
        // eslint-disable-next-line no-console
        console.error("[promo] invalid line allocation", l);
      }
    }
  }

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = PROMOS.find((p) => p.code === code);
    if (!found) {
      toast.error("Invalid promo code");
      return;
    }
    setPromo(found);
    toast.success(`Promo applied: ${found.label}`);
  };

  const removePromo = () => {
    setPromo(null);
    setPromoInput("");
  };

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

    // Final guard: recompute totals from authoritative item data so a tampered
    // client state can't submit negative or inconsistent amounts.
    const guard = buildSafeOrderTotals(
      items.map((i) => ({ price: i.price, quantity: i.quantity })),
      promo,
      TAX_RATE
    );
    if (!guard.ok) {
      toast.error(`Order rejected: ${guard.error}`);
      return;
    }
    const safe = guard.totals;

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
          notes: [parsed.data.notes, promo ? `Promo: ${promo.code} (${promo.label}) −$${safe.discount.toFixed(2)}` : null].filter(Boolean).join(" • ") || null,
          subtotal: safe.subtotal,
          tax: safe.tax,
          total: safe.total,
          status: "pending",
          payment_status: "unpaid",
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const orderItems = items.map((i, idx) => {
        const alloc = safe.lines[idx];
        const lineTotal = alloc ? Math.max(0, alloc.lineAfter) : Math.max(0, i.price * i.quantity);
        return {
          order_id: order.id,
          menu_item_id: i.menuItemId,
          item_name: i.optionLabel ? `${i.name} — ${i.optionLabel}` : i.name,
          unit_price: i.price,
          quantity: i.quantity,
          line_total: lineTotal,
          selected_options: (i.selectedOptions ?? []) as any,
          notes: i.notes ?? null,
        };
      });

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
            <ul className="space-y-3 mb-6 max-h-96 overflow-auto pr-2">
              {items.map((i, idx) => {
                const opts = i.selectedOptions ?? [];
                const optionsTotal = opts.reduce((s, o) => s + Number(o.price_adjustment ?? 0), 0);
                const basePrice = i.price - optionsTotal;
                const alloc = breakdown.lines[idx] ?? { lineTotal: i.price * i.quantity, lineDiscount: 0, lineAfter: i.price * i.quantity };
                const lineTotal = alloc.lineTotal;
                const lineDiscount = alloc.lineDiscount;
                const lineAfter = alloc.lineAfter;
                return (
                  <li key={i.id} className="border-b border-border/40 pb-3">
                    <div className="flex justify-between gap-2 mb-1">
                      <div className="font-stencil text-sm">{i.name}</div>
                      <div className="text-right shrink-0">
                        {lineDiscount > 0 ? (
                          <>
                            <div className="text-[11px] text-muted-foreground line-through">${lineTotal.toFixed(2)}</div>
                            <div className="font-display text-base text-primary">${lineAfter.toFixed(2)}</div>
                          </>
                        ) : (
                          <div className="font-display text-base text-primary">${lineTotal.toFixed(2)}</div>
                        )}
                      </div>
                    </div>

                    {opts.length > 0 ? (
                      <div className="rounded-md bg-background/60 border border-border/40 p-2 space-y-0.5 text-[11px] mt-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Base</span>
                          <span>${basePrice.toFixed(2)}</span>
                        </div>
                        {opts.map((o, idx) => (
                          <div key={idx} className="flex justify-between text-muted-foreground">
                            <span className="truncate pr-2">
                              <span className="text-muted-foreground/60">{o.group}:</span> {o.name}
                            </span>
                            <span
                              className={
                                o.price_adjustment > 0
                                  ? "text-primary shrink-0"
                                  : o.price_adjustment < 0
                                  ? "text-emerald-400 shrink-0"
                                  : "text-muted-foreground/60 shrink-0"
                              }
                            >
                              {o.price_adjustment > 0
                                ? `+$${Number(o.price_adjustment).toFixed(2)}`
                                : o.price_adjustment < 0
                                ? `−$${Math.abs(Number(o.price_adjustment)).toFixed(2)}`
                                : "Included"}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-1 mt-1 border-t border-border/40 text-foreground">
                          <span className="font-stencil">Unit</span>
                          <span className="font-stencil">${i.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : null}

                    {i.notes && (
                      <div className="text-[11px] italic text-muted-foreground/80 mt-1">Note: {i.notes}</div>
                    )}

                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                      <span>${i.price.toFixed(2)} × {i.quantity}</span>
                      {opts.length === 0 && i.priceLabel && <span>{i.priceLabel}</span>}
                    </div>

                    {lineDiscount > 0 && (
                      <div className="flex justify-between text-[11px] text-emerald-400 mt-0.5">
                        <span>Promo {promo?.code} {promo?.type === "percent" ? `(−${Math.round(discountRate * 100)}%)` : "(allocated)"}</span>
                        <span>−${lineDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Promo code */}
            <div className="border-t border-border pt-4 mb-4">
              <Label htmlFor="promo" className="flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Tag className="h-3.5 w-3.5" /> Promo Code
              </Label>
              {promo ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                  <div className="text-sm">
                    <span className="font-stencil text-emerald-400">{promo.code}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{promo.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove promo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code"
                    className="h-10 uppercase"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyPromo();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={applyPromo} className="h-10 font-stencil">
                    Apply
                  </Button>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-1.5">Try SMOKE10, BBQ20, or PITMASTER5</p>
            </div>

            <div className="space-y-1.5 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${sub.toFixed(2)}</span>
              </div>
              {promo && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({promo.code})</span>
                  <span>−${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {promo && discountAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal after discount</span>
                  <span>${discountedSub.toFixed(2)}</span>
                </div>
              )}
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
