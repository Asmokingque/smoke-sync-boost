import { useState } from "react";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Tag, X, Bug, Download, Check, ShoppingCart, User, Receipt, Sparkles, Clock, Phone, Mail, MessageSquare, MapPin, Store, Truck, Plus, Minus, Trash2, Heart, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { computeDiscount, buildSafeOrderTotals, type Promo } from "@/lib/promo";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100),
  customer_email: z.string().trim().email("Invalid email").max(255),
  customer_phone: z.string().trim().min(7, "Phone is required").max(30),
  pickup_time: z.string().optional(),
  notes: z.string().max(500).optional(),
  order_type: z.enum(["Pickup", "Delivery"]),
  delivery_address: z.string().trim().max(300).optional(),
}).refine((d) => d.order_type !== "Delivery" || (d.delivery_address && d.delivery_address.length >= 6), {
  message: "Delivery address is required",
  path: ["delivery_address"],
});

const TAX_RATE = 0.07;

const PROMOS: Promo[] = [
  { code: "SMOKE10", label: "10% off", type: "percent", value: 0.1 },
  { code: "BBQ20", label: "20% off", type: "percent", value: 0.2 },
  { code: "PITMASTER5", label: "$5 off order", type: "fixed", value: 5 },
];

const Checkout = () => {
  const { items, subtotal, clear, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const debugEnabled = searchParams.get("debug") === "1";
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const toggleDebug = () => {
    const next = new URLSearchParams(searchParams);
    if (debugEnabled) next.delete("debug");
    else next.set("debug", "1");
    setSearchParams(next, { replace: true });
  };

  const exportDebugJson = () => {
    const summed = breakdown.lines.reduce((s, l) => s + l.lineDiscount, 0);

    // Reproduce the exact server submission payload (without persisting).
    const guard = buildSafeOrderTotals(
      items.map((i) => ({ price: i.price, quantity: i.quantity })),
      promo,
      TAX_RATE
    );
    const safe = guard.ok === true ? guard.totals : null;
    const guardError = guard.ok === true ? null : guard.error;

    const orderInsert = safe
      ? {
          user_id: user?.id ?? null,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          pickup_time: form.pickup_time ? new Date(form.pickup_time).toISOString() : null,
          notes:
            [
              form.notes,
              promo ? `Promo: ${promo.code} (${promo.label}) −$${safe.discount.toFixed(2)}` : null,
            ]
              .filter(Boolean)
              .join(" • ") || null,
          subtotal: safe.subtotal,
          tax: safe.tax,
          total: safe.total,
          status: "pending",
          payment_status: "unpaid",
        }
      : null;

    const orderItemsInsert = safe
      ? items.map((i, idx) => {
          const alloc = safe.lines[idx];
          const lineTotal = alloc ? Math.max(0, alloc.lineAfter) : Math.max(0, i.price * i.quantity);
          return {
            order_id: "<assigned-after-order-insert>",
            menu_item_id: i.menuItemId,
            item_name: i.optionLabel ? `${i.name} — ${i.optionLabel}` : i.name,
            unit_price: i.price,
            quantity: i.quantity,
            line_total: lineTotal,
            selected_options: i.selectedOptions ?? [],
            notes: i.notes ?? null,
          };
        })
      : null;

    const payload = {
      generatedAt: new Date().toISOString(),
      promo: promo
        ? { code: promo.code, label: promo.label, type: promo.type, value: promo.value }
        : null,
      taxRate: TAX_RATE,
      items: items.map((i, idx) => ({
        index: idx,
        name: i.name,
        unitPrice: i.price,
        quantity: i.quantity,
        optionLabel: i.optionLabel ?? null,
        notes: i.notes ?? null,
        selectedOptions: i.selectedOptions ?? [],
        allocation: breakdown.lines[idx] ?? null,
      })),
      totals: {
        subtotal: sub,
        discount: discountAmount,
        discountedSubtotal: discountedSub,
        tax,
        total,
      },
      invariants: {
        sumOfLineDiscounts: summed,
        driftFromDiscount: Math.abs(summed - discountAmount),
        discountWithinSubtotal: discountAmount <= sub + 0.001,
        allLinesNonNegative: breakdown.lines.every((l) => l.lineAfter >= 0),
        taxNonNegative: tax >= 0,
        totalNonNegative: total >= 0,
      },
      serverPayload: {
        guardOk: guard.ok,
        guardError,
        promoInputs: promo
          ? { code: promo.code, type: promo.type, value: promo.value }
          : null,
        taxRate: TAX_RATE,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
        computedTotals: safe,
        orderInsert,
        orderItemsInsert,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `checkout-debug-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Debug breakdown exported");
  };
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: user?.email ?? "",
    customer_phone: "",
    pickup_time: "",
    notes: "",
    order_type: "Pickup" as "Pickup" | "Delivery",
    delivery_address: "",
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
        <section className="container py-24 text-center max-w-xl">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full border border-gold/30 bg-gradient-smoke mb-8 ring-gold-soft">
            <ShoppingBag className="h-10 w-10 text-gold" />
          </div>
          <span className="badge-premium mb-4 inline-flex"><Sparkles className="h-3 w-3" />Empty Cart</span>
          <h1 className="font-serif text-5xl md:text-6xl mb-3 tracking-tight">Your cart is empty</h1>
          <span className="gold-rule-short mx-auto block mb-5" />
          <p className="text-muted-foreground mb-8 leading-relaxed">Browse our smokehouse menu and build your order — slow-smoked, served bold.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-12 px-10 shadow-ember">
            <Link to="/menu">Browse Menu</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  const steps = [
    { id: 1, label: "Cart", icon: ShoppingCart, done: true, active: false },
    { id: 2, label: "Details", icon: User, done: false, active: true },
    { id: 3, label: "Confirm", icon: Receipt, done: false, active: false },
  ];

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
    if (guard.ok === false) {
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
          order_type: parsed.data.order_type,
          delivery_address: parsed.data.order_type === "Delivery" ? parsed.data.delivery_address ?? null : null,
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
      {/* Premium hero with step indicator */}
      <section className="relative bg-gradient-smoke border-b border-gold/20 overflow-hidden">
        <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 h-[20rem] w-[36rem] rounded-full bg-primary/15 blur-[140px]" />
        <div className="relative container py-14 md:py-16 max-w-5xl text-center">
          <span className="badge-premium mb-5 inline-flex"><Sparkles className="h-3 w-3" />Secure Checkout</span>
          <h1 className="font-serif text-5xl md:text-6xl mb-2 tracking-tight">
            Complete Your <span className="italic text-gradient-ember">Order</span>
          </h1>
          <span className="gold-rule-short mx-auto block mt-5 mb-3" />
          <p className="text-sm text-muted-foreground">Smoked low. Served bold. Pickup made simple.</p>

          <ol className="mt-10 flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const state = s.active ? "active" : s.done ? "done" : "todo";
              return (
                <li key={s.id} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={[
                        "h-10 w-10 rounded-full border flex items-center justify-center transition-colors",
                        state === "active"
                          ? "border-gold bg-primary/20 text-gold ring-gold-soft"
                          : state === "done"
                          ? "border-gold/60 bg-gold/10 text-gold"
                          : "border-border/60 bg-background/40 text-muted-foreground",
                      ].join(" ")}
                    >
                      {state === "done" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={[
                        "text-[10px] uppercase tracking-[0.2em] font-stencil",
                        state === "active" ? "text-gold" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-border/40 -mt-5" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="container py-12 md:py-16 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <form onSubmit={handleSubmit} className="space-y-8 premium-glass-card p-6 md:p-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
                <h2 className="font-serif text-2xl tracking-tight whitespace-nowrap">Order Method</h2>
                <span className="h-px flex-1 bg-gradient-to-l from-gold/50 to-transparent" />
              </div>
              <p className="text-xs text-muted-foreground text-center">Choose how you'd like to receive your order.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "Pickup" as const, icon: Store, title: "Pickup", sub: "Ready at the smokehouse" },
                { value: "Delivery" as const, icon: Truck, title: "Delivery", sub: "We bring it to you" },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = form.order_type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, order_type: opt.value })}
                    className={[
                      "rounded-2xl border p-4 text-left transition-all flex items-start gap-3",
                      active
                        ? "border-gold/70 bg-gradient-to-br from-primary/15 to-background/40 ring-gold-soft"
                        : "border-border/60 bg-background/40 hover:border-gold/40",
                    ].join(" ")}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${active ? "text-gold" : "text-muted-foreground"}`} />
                    <div>
                      <div className={`font-stencil text-sm tracking-wider ${active ? "text-gold" : "text-foreground"}`}>{opt.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {form.order_type === "Delivery" && (
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="h-3 w-3 text-gold" />Delivery Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  rows={2}
                  placeholder="Street, city, ZIP, apt #, gate code…"
                  maxLength={300}
                  className="luxury-input"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
                <h2 className="font-serif text-2xl tracking-tight whitespace-nowrap">Your Details</h2>
                <span className="h-px flex-1 bg-gradient-to-l from-gold/50 to-transparent" />
              </div>
              <p className="text-xs text-muted-foreground text-center">Tell us how to reach you when your order's ready.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><User className="h-3 w-3 text-gold" />Name *</Label>
                <Input id="name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="luxury-input h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><Phone className="h-3 w-3 text-gold" />Phone *</Label>
                <Input id="phone" type="tel" required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="luxury-input h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><Mail className="h-3 w-3 text-gold" />Email *</Label>
              <Input id="email" type="email" required value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="luxury-input h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3 w-3 text-gold" />
                {form.order_type === "Delivery" ? "Preferred Delivery Time" : "Preferred Pickup Time"}
              </Label>
              <Input id="pickup" type="datetime-local" value={form.pickup_time} onChange={(e) => setForm({ ...form, pickup_time: e.target.value })} className="luxury-input h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><MessageSquare className="h-3 w-3 text-gold" />Special Requests</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Allergies, sauce on the side, etc." className="luxury-input" />
            </div>

            <div className="rounded-md border border-gold/30 bg-gradient-to-r from-primary/5 via-gold/5 to-primary/5 p-4 text-sm flex gap-3">
              <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-gold font-stencil tracking-wider text-xs uppercase block mb-1">
                  {form.order_type === "Delivery" ? "Pay on Delivery" : "Pay at Pickup"}
                </strong>
                <span className="text-muted-foreground">We'll confirm your order by phone or email. Online card payment is coming soon.</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="h-14 luxury-primary-btn font-stencil text-sm tracking-widest"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : `Place ${form.order_type} Order`}
              </Button>
              <Button
                type="button"
                disabled
                title="Card payment coming soon"
                className="h-14 luxury-secondary-btn font-stencil text-sm tracking-widest cursor-not-allowed opacity-80"
              >
                Pay with Card · ${total.toFixed(2)}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/70 text-center -mt-4">
              Secure card checkout via Stripe — coming soon.
            </p>
          </form>

          <aside className="premium-glass-card p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-2xl tracking-tight">Order Summary</h2>
            </div>
            <span className="gold-rule-short block mb-5" />
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

                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center rounded-full border border-gold/30 bg-background/50 overflow-hidden">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(i.id, i.quantity - 1)}
                          className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 font-stencil text-xs tracking-widest text-foreground min-w-[1.75rem] text-center">{i.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(i.id, i.quantity + 1)}
                          className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">${i.price.toFixed(2)} ea</span>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeItem(i.id)}
                          className="text-muted-foreground/70 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
              <div className="mt-3 pt-3 border-t border-gold/30">
                <div className="flex justify-between items-baseline">
                  <span className="font-stencil text-xs uppercase tracking-[0.25em] text-gold">Total</span>
                  <span className="font-serif text-3xl text-gradient-ember">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Debug panel */}
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleDebug}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  aria-expanded={debugEnabled}
                >
                  <Bug className="h-3 w-3" />
                  {debugEnabled ? "Hide" : "Show"} debug breakdown
                </button>
                {debugEnabled && (
                  <button
                    type="button"
                    onClick={exportDebugJson}
                    className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Export JSON
                  </button>
                )}
              </div>

              {debugEnabled && (
                <div className="mt-3 rounded-md bg-background/60 border border-border/40 p-3 text-[11px] font-mono space-y-3">
                  <div>
                    <div className="text-muted-foreground/70 uppercase tracking-wider mb-1">Promo</div>
                    {promo ? (
                      <div className="grid grid-cols-2 gap-x-3">
                        <span className="text-muted-foreground">code</span><span>{promo.code}</span>
                        <span className="text-muted-foreground">type</span><span>{promo.type}</span>
                        <span className="text-muted-foreground">value</span><span>{promo.type === "percent" ? `${(promo.value * 100).toFixed(0)}%` : `$${promo.value.toFixed(2)}`}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">none</div>
                    )}
                  </div>

                  <div>
                    <div className="text-muted-foreground/70 uppercase tracking-wider mb-1">Per-line allocation</div>
                    <div className="space-y-1.5">
                      {breakdown.lines.map((l, idx) => {
                        const it = items[idx];
                        return (
                          <div key={idx} className="border border-border/40 rounded p-1.5">
                            <div className="truncate text-foreground mb-0.5">{idx + 1}. {it?.name ?? "—"} × {it?.quantity ?? 0}</div>
                            <div className="grid grid-cols-2 gap-x-3 text-muted-foreground">
                              <span>lineTotal</span><span>${l.lineTotal.toFixed(4)}</span>
                              <span>lineDiscount</span><span className="text-emerald-400">−${l.lineDiscount.toFixed(4)}</span>
                              <span>lineAfter</span><span className="text-primary">${l.lineAfter.toFixed(4)}</span>
                            </div>
                          </div>
                        );
                      })}
                      {breakdown.lines.length === 0 && (
                        <div className="text-muted-foreground">no lines</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground/70 uppercase tracking-wider mb-1">Totals</div>
                    <div className="grid grid-cols-2 gap-x-3">
                      <span className="text-muted-foreground">subtotal</span><span>${sub.toFixed(4)}</span>
                      <span className="text-muted-foreground">discount</span><span className="text-emerald-400">−${discountAmount.toFixed(4)}</span>
                      <span className="text-muted-foreground">discountedSub</span><span>${discountedSub.toFixed(4)}</span>
                      <span className="text-muted-foreground">taxRate</span><span>{(TAX_RATE * 100).toFixed(2)}%</span>
                      <span className="text-muted-foreground">tax</span><span>${tax.toFixed(4)}</span>
                      <span className="text-muted-foreground">total</span><span className="text-primary">${total.toFixed(4)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground/70 uppercase tracking-wider mb-1">Invariants</div>
                    {(() => {
                      const summed = breakdown.lines.reduce((s, l) => s + l.lineDiscount, 0);
                      const drift = Math.abs(summed - discountAmount);
                      const checks = [
                        { label: "Σ lineDiscount ≈ discount", ok: drift < 0.02, detail: `drift ${drift.toFixed(4)}` },
                        { label: "discount ≤ subtotal", ok: discountAmount <= sub + 0.001 },
                        { label: "all lineAfter ≥ 0", ok: breakdown.lines.every((l) => l.lineAfter >= 0) },
                        { label: "tax ≥ 0", ok: tax >= 0 },
                        { label: "total ≥ 0", ok: total >= 0 },
                      ];
                      return (
                        <div className="space-y-0.5">
                          {checks.map((c, i) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span className="text-muted-foreground">{c.label}</span>
                              <span className={c.ok ? "text-emerald-400" : "text-destructive"}>
                                {c.ok ? "OK" : "FAIL"}{c.detail ? ` (${c.detail})` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Checkout;
