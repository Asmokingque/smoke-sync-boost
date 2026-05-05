import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";

const Account = () => {
  const { user, loading, isAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data ?? []);
      setLoadingOrders(false);
    })();
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <SiteLayout>
      <section className="container py-12 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="font-stencil text-sm text-primary mb-1">Account</div>
            <h1 className="font-display text-4xl">{user?.user_metadata?.display_name || user?.email}</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild variant="outline" className="font-stencil">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
            <Button onClick={signOut} variant="outline" className="font-stencil">Sign Out</Button>
          </div>
        </div>

        <h2 className="font-display text-2xl mb-4 tracking-wider">Order History</h2>
        {loadingOrders ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet. <Link to="/menu" className="text-primary hover:underline">Browse the menu</Link>.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="bg-gradient-card border border-border rounded-lg p-5">
                <div className="flex justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="font-stencil text-xs text-muted-foreground">Order #{o.order_number ?? o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl text-primary">${Number(o.total).toFixed(2)}</div>
                    <div className="text-xs font-stencil text-muted-foreground uppercase">{o.payment_status} · {o.status}</div>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-3 mt-1 mb-3">
                  <OrderStatusTimeline status={o.status} paymentStatus={o.payment_status} />
                </div>
                <ul className="text-sm text-muted-foreground space-y-0.5 border-t border-border/50 pt-3 mt-2">
                  {o.order_items.map((i: any) => (
                    <li key={i.id}>{i.quantity}× {i.item_name}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
};

export default Account;
