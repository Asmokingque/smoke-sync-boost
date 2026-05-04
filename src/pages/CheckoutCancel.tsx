import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  return (
    <SiteLayout>
      <section className="container py-20 md:py-28 max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="inline-flex items-center justify-center h-24 w-24 rounded-full border border-border bg-card/60 mb-8"
        >
          <XCircle className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </motion.div>
        <h1 className="font-serif text-5xl md:text-6xl mb-3 tracking-tight">
          Checkout <span className="italic text-muted-foreground">cancelled</span>
        </h1>
        <span className="gold-rule-short mx-auto block mb-5" />
        <p className="text-muted-foreground leading-relaxed mb-8">
          Your cart is still here. No payment was taken — try again whenever you're ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-12 px-8">
            <Link to="/checkout">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Checkout
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gold/40 font-stencil h-12 px-8">
            <Link to="/menu">Keep Browsing</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
