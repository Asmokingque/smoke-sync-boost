/**
 * AdminDashboard.tsx
 * Controls: /admin — the dashboard homepage with at-a-glance metric cards.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, DollarSign, MessageSquareText, Mail, PackageX, Sparkles, Loader2 } from "lucide-react";

type Stats = {
  newOrders: number;
  todaySales: number;
  pendingReviews: number;
  cateringRequests: number;
  soldOutItems: number;
  activeSpecials: number;
};

const AdminDashboard = () => {
  const { isSuperAdmin, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();

      const [newOrders, todayOrders, reviews, catering, soldOut, specials] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total").gte("created_at", iso).neq("status", "cancelled"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("catering_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("is_available", false),
        supabase.from("specials").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      setStats({
        newOrders: newOrders.count ?? 0,
        todaySales: (todayOrders.data ?? []).reduce((sum, o: { total: number }) => sum + Number(o.total ?? 0), 0),
        pendingReviews: reviews.count ?? 0,
        cateringRequests: catering.count ?? 0,
        soldOutItems: soldOut.count ?? 0,
        activeSpecials: specials.count ?? 0,
      });
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl">Dashboard</h1>
          <RoleBadge isSuperAdmin={isSuperAdmin} />
        </div>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.email} · Anderson&rsquo;s Smoking Que
        </p>
      </header>

      {!stats ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="New Orders" value={stats.newOrders} hint="Awaiting confirmation" icon={ShoppingBag} to="/admin/orders" />
          <StatCard label="Today's Sales" value={`$${stats.todaySales.toFixed(2)}`} hint="Since midnight" icon={DollarSign} to="/admin/orders" tone="gold" />
          <StatCard label="Pending Reviews" value={stats.pendingReviews} hint="Need approval" icon={MessageSquareText} to="/admin/reviews" />
          <StatCard label="Catering Requests" value={stats.cateringRequests} hint="New inquiries" icon={Mail} to="/admin/catering" />
          <StatCard label="Sold Out Items" value={stats.soldOutItems} hint="Marked unavailable" icon={PackageX} to="/admin/menu" />
          <StatCard label="Active Specials" value={stats.activeSpecials} hint="Live on the site" icon={Sparkles} to="/admin/specials" tone="gold" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
