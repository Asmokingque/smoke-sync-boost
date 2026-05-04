import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Receipt } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order") ?? params.get("session_id");
  const clear = useCart((s) => s.clear);

  // Stripe webhook is the source of truth for "Paid". The cart is local only,
  // so it is safe to clear once the customer is back on the success page.
  useEffect(() => {
    clear();
  }, [clear]);

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
          <div className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-card/60 px-5 py-3 mb-10">
            <Receipt className="h-4 w-4 text-gold" />
            <span className="font-stencil text-xs tracking-[0.2em] text-muted-foreground">Order</span>
            <span className="font-display text-base text-foreground">{orderNumber}</span>
          </div>
        )}

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
