import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Receipt } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order") ?? params.get("session_id");
  const clear = useCart((s) => s.clear);
  const [order, setOrder] = useState<{ status: string; payment_status: string } | null>(null);

  useEffect(() => {
    clear();
  }, [clear]);

  // Poll order status briefly while webhook flips it to paid/confirmed.
  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;
    let attempts = 0;

    async function fetchOrder() {
      const isUuid = /^[0-9a-f-]{36}$/i.test(orderNumber!);
      const query = supabase.from("orders").select("status, payment_status").limit(1);
      const { data } = isUuid
        ? await query.eq("id", orderNumber!).maybeSingle()
        : await query.eq("order_number", orderNumber!).maybeSingle();
      if (cancelled) return;
      if (data) setOrder(data as { status: string; payment_status: string });
      attempts += 1;
      if (!cancelled && attempts < 10 && (!data || data.payment_status !== "paid")) {
        setTimeout(fetchOrder, 2000);
      }
    }
    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  return (
    <SiteLayout>
      <section className="container py-20 md:py-28 max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="relative inline-flex items-center justify-center h-24 w-24 rounded-full border border-gold/40 bg-gradient-smoke mb-8 ring-gold-soft"
        >
          <span aria-hidden className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
          <CheckCircle2 className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
        </motion.div>

        <span className="badge-premium mb-4 inline-flex">
          <Sparkles className="h-3 w-3" />
          Order Confirmed
        </span>
        <h1 className="font-serif text-5xl md:text-6xl mb-3 tracking-tight">
          Thank you for your <span className="italic text-gradient-ember">order</span>
        </h1>
        <span className="gold-rule-short mx-auto block mb-5" />
        <p className="text-muted-foreground leading-relaxed mb-8">
          Payment confirmed. We've fired up the pit — you'll get a text when your order is ready.
        </p>

        {orderNumber && (
          <div className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-card/60 px-5 py-3 mb-8">
            <Receipt className="h-4 w-4 text-gold" />
            <span className="font-stencil text-xs tracking-[0.2em] text-muted-foreground">Order</span>
            <span className="font-display text-base text-foreground">{orderNumber}</span>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card/40 p-5 mb-10">
          <div className="font-stencil text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-4">
            Order Status
          </div>
          <OrderStatusTimeline
            status={order?.status}
            paymentStatus={order?.payment_status}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-12 px-8">
            <Link to="/order-status">Track Order</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold/40 font-stencil h-12 px-8">
            <Link to="/menu">Order Again</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
