import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { Loader2, PackageCheck, ShoppingBag, TimerReset, Wallet } from "lucide-react";
import { DashboardMetricSkeleton } from "@/components/skeletons/DashboardMetricSkeleton";

type Stats = {
  newOrders: number;
  ordersToday: number;
  todaySales: number;
  preparing: number;
  ready: number;
};

const AdminDashboard = () => {
  const { isSuperAdmin, user } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();

      const [newOrders, ordersToday, todaySalesRows, preparing, ready] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("orders").select("total").gte("created_at", iso).neq("status", "cancelled"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "preparing"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "ready"),
      ]);

      setStats({
        newOrders: newOrders.count ?? 0,
        ordersToday: ordersToday.count ?? 0,
        todaySales: (todaySalesRows.data ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0),
        preparing: preparing.count ?? 0,
        ready: ready.count ?? 0,
      });
    };

    void load();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl">Dashboard</h1>
          <RoleBadge isSuperAdmin={isSuperAdmin} />
        </div>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">Signed in as {user?.email} · Anderson&rsquo;s Smoking Que</p>
      </header>

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => <DashboardMetricSkeleton key={index} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="New Orders" value={stats.newOrders} hint="Awaiting confirmation" icon={ShoppingBag} to="/admin/orders" />
          <StatCard label="Orders Today" value={stats.ordersToday} hint="Since midnight" icon={PackageCheck} to="/admin/orders" tone="gold" />
          <StatCard label="Today's Sales" value={`$${stats.todaySales.toFixed(2)}`} hint="Gross sales today" icon={Wallet} to="/admin/orders" tone="gold" />
          <StatCard label="Preparing" value={stats.preparing} hint="Active kitchen queue" icon={TimerReset} to="/admin/orders" />
          <StatCard label="Ready for Pickup" value={stats.ready} hint="Ready to hand off" icon={Loader2} to="/admin/orders" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
