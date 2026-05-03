import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Clock,
  Phone,
  Mail,
  User,
  Receipt,
  Printer,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formatDateTime = (iso?: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
};

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      setOrder(data);
      setLoading(false);
    })();
  }, [id]);

  const orderRef =
    order?.order_number ?? (order?.id ? order.id.slice(0, 8).toUpperCase() : "");

  const copyRef = async () => {
    if (!orderRef) return;
    try {
      await navigator.clipboard.writeText(orderRef);
      toast.success("Order number copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <section className="container py-32 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-gold" />
        </section>
      </SiteLayout>
    );
  }

  const itemsCount =
    order?.order_items?.reduce(
      (s: number, i: any) => s + Number(i.quantity ?? 0),
      0,
    ) ?? 0;
  const pickup = formatDateTime(order?.pickup_time);

  return (
    <SiteLayout>
      {/* Premium hero */}
      <section className="relative bg-gradient-smoke border-b border-gold/20 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 -translate-x-1/2 h-[26rem] w-[44rem] rounded-full bg-primary/20 blur-[160px]"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[18rem] w-[18rem] rounded-full bg-gold/10 blur-[120px]"
        />
        <div className="relative container py-20 md:py-24 max-w-3xl text-center">
          {/* Premium check medallion */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-ember-pulse"
            />
            <span className="relative inline-flex items-center justify-center h-24 w-24 rounded-full border border-gold/60 bg-gradient-to-br from-primary/30 to-charcoal-light ring-gold-soft">
              <CheckCircle2 className="h-11 w-11 text-gold" strokeWidth={1.5} />
            </span>
          </div>

          <span className="badge-premium mb-5 inline-flex">
            <Sparkles className="h-3 w-3" />
            Order Confirmed
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-3 tracking-tight leading-[1.05]">
            Thank You
            {order?.customer_name ? (
              <>
                ,{" "}
                <span className="italic text-gradient-ember">
                  {order.customer_name.split(" ")[0]}
                </span>
              </>
            ) : null}
            .
          </h1>
          <span className="gold-rule-short mx-auto block mt-5 mb-5" />
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your order is in the smokehouse. We'll confirm details shortly by phone or
            email — get ready to taste it.
          </p>

          {/* Order ref + actions */}
          {orderRef && (
            <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={copyRef}
                className="group inline-flex items-center gap-3 rounded-full border border-gold/40 bg-background/60 backdrop-blur-md px-5 py-2.5 hover:border-gold/70 transition-colors"
              >
                <span className="font-stencil text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Order #
                </span>
                <span className="font-serif text-lg text-gold">{orderRef}</span>
              </button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="rounded-full border-gold/30 hover:border-gold/60 hover:bg-gold/5 font-stencil text-xs tracking-widest h-10"
              >
                <Printer className="h-3.5 w-3.5 mr-2" /> Print Receipt
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Receipt body */}
      <section className="container py-12 md:py-16 max-w-3xl">
        {order && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pickup details */}
            <div className="retina-menu-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gold" />
                <h3 className="font-serif text-xl tracking-tight">Pickup</h3>
              </div>
              <span className="gold-rule-short block mb-4" />
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />
                  <div>
                    <div className="text-foreground">Anderson's Smoking Que</div>
                    <div className="text-muted-foreground text-xs">
                      We'll text you when it's ready.
                    </div>
                  </div>
                </div>
                {pickup && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-stencil">
                        Requested time
                      </div>
                      <div className="text-foreground">{pickup}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="retina-menu-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-gold" />
                <h3 className="font-serif text-xl tracking-tight">Contact</h3>
              </div>
              <span className="gold-rule-short block mb-4" />
              <div className="space-y-3 text-sm">
                {order.customer_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span>{order.customer_name}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="hover:text-gold transition-colors"
                    >
                      {order.customer_phone}
                    </a>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="hover:text-gold transition-colors truncate"
                    >
                      {order.customer_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {order && (
          <div className="retina-menu-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gold" />
                <h2 className="font-serif text-2xl tracking-tight">Your Order</h2>
              </div>
              <span className="text-xs text-muted-foreground font-stencil tracking-widest">
                {itemsCount} {itemsCount === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>
            <span className="gold-rule-short block mb-5" />

            <ul className="space-y-3 mb-6">
              {order.order_items?.map((i: any) => (
                <li
                  key={i.id}
                  className="flex justify-between items-start gap-4 pb-3 border-b border-border/40 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="font-stencil text-xs uppercase tracking-wider text-gold/80 mb-0.5">
                      {i.quantity}×
                    </div>
                    <div className="text-foreground leading-snug">{i.item_name}</div>
                    {i.notes && (
                      <div className="text-[11px] italic text-muted-foreground/80 mt-1">
                        {i.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-serif text-base text-foreground shrink-0">
                    ${Number(i.line_total ?? i.unit_price * i.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 text-sm border-t border-border pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${Number(order.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${Number(order.tax ?? 0).toFixed(2)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gold/30 flex justify-between items-baseline">
                <span className="font-stencil text-xs uppercase tracking-[0.25em] text-gold">
                  Total
                </span>
                <span className="font-serif text-3xl text-gradient-ember">
                  ${Number(order.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 rounded-md border border-gold/20 bg-background/40 p-4">
                <div className="font-stencil text-[10px] uppercase tracking-[0.2em] text-gold mb-1.5">
                  Notes
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next steps */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <Button
            asChild
            className="h-14 bg-primary hover:bg-primary/90 font-stencil tracking-widest shadow-ember"
          >
            <Link to={`/order-status/${id}`}>
              Track Your Order <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 border-gold/40 hover:border-gold/70 hover:bg-gold/5 font-stencil tracking-widest"
          >
            <Link to="/menu">Order Again</Link>
          </Button>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground tracking-[0.2em] uppercase font-stencil">
          Smoked Low · Served Bold
        </p>
      </section>
    </SiteLayout>
  );
};

export default OrderConfirmation;
