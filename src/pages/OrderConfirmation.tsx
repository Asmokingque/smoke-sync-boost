import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
      setOrder(data);
      setLoading(false);
    })();
  }, [id]);

  return (
    <SiteLayout>
      <section className="container py-16 md:py-24 max-w-2xl text-center">
        {loading ? (
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        ) : (
          <>
            <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-4 animate-ember-pulse rounded-full" />
            <h1 className="font-display text-4xl md:text-5xl mb-3">Order Received!</h1>
            <p className="text-muted-foreground mb-6">
              Thanks{order?.customer_name ? `, ${order.customer_name}` : ""}. We'll confirm your order
              shortly via phone or email.
            </p>
            {order && (
              <div className="bg-gradient-card border border-border rounded-lg p-6 text-left mb-8">
                <div className="font-stencil text-xs text-muted-foreground mb-1">Order #</div>
                <div className="font-display text-xl mb-4">{order.id.slice(0, 8).toUpperCase()}</div>
                <ul className="space-y-2 mb-4">
                  {order.order_items?.map((i: any) => (
                    <li key={i.id} className="flex justify-between text-sm">
                      <span>{i.quantity}× {i.item_name}</span>
                      <span>${(i.unit_price * i.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-3 flex justify-between font-display text-lg">
                  <span>Total</span>
                  <span className="text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            )}
            <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-12 px-8">
              <Link to="/menu">Order More</Link>
            </Button>
          </>
        )}
      </section>
    </SiteLayout>
  );
};

export default OrderConfirmation;
