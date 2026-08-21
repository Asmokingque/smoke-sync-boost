import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { OrderWithItems } from "@/types/orders";
import { filterAdminOrders, type AdminOrderFilter } from "@/lib/ordering";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { OrderDetailsDrawer } from "@/components/admin/orders/OrderDetailsDrawer";
import { NewOrderAlert } from "@/components/admin/orders/NewOrderAlert";
import { OrdersTableSkeleton } from "@/components/skeletons/OrdersTableSkeleton";

type StatusHistoryRow = {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
};

async function invokeAdminUpdate(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-update-order", { body });
  if (error) throw error;
  return data;
}

export function OrdersManager() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filter, setFilter] = useState<AdminOrderFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [timeline, setTimeline] = useState<StatusHistoryRow[]>([]);
  const [newOrder, setNewOrder] = useState<OrderWithItems | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setOrders((data ?? []) as OrderWithItems[]);
    setLoading(false);
  };

  const loadTimeline = async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_status_history")
      .select("id, order_id, previous_status, new_status, notes, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTimeline((data ?? []) as StatusHistoryRow[]);
  };

  useEffect(() => {
    void loadOrders();
    const channel = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        void loadOrders();
        if (payload.eventType === "INSERT") {
          setNewOrder(payload.new as unknown as OrderWithItems);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleOrders = useMemo(() => filterAdminOrders(orders, filter, search), [filter, orders, search]);

  const handleView = async (order: OrderWithItems) => {
    setSelectedOrder(order);
    await loadTimeline(order.id);
  };

  const handlePrint = (order: OrderWithItems) => {
    const printWindow = window.open("", "_blank", "width=420,height=640,noopener");
    if (!printWindow) {
      toast.error("Allow pop-ups to print order tickets.");
      return;
    }

    const itemsHtml = order.order_items
      .map((item) => `<li>${item.quantity}× ${item.item_name} — $${Number(item.line_total).toFixed(2)}</li>`)
      .join("");

    printWindow.document.write(`<!doctype html><html><body style="font-family: monospace; padding: 16px;"><h1>Anderson's Smoking Que</h1><p>Order #${order.order_number ?? order.id.slice(0, 8).toUpperCase()}</p><p>${order.customer_name}<br/>${order.customer_phone}</p><ul>${itemsHtml}</ul><p><strong>Total: $${Number(order.total).toFixed(2)}</strong></p></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleStatusChange = async (order: OrderWithItems, status: string) => {
    await invokeAdminUpdate({ orderId: order.id, status });
    toast.success("Order status updated.");
    await loadOrders();
    if (selectedOrder?.id === order.id) await loadTimeline(order.id);
  };

  const handlePaymentStatusChange = async (order: OrderWithItems, paymentStatus: string) => {
    await invokeAdminUpdate({ orderId: order.id, paymentStatus });
    toast.success("Payment status updated.");
    await loadOrders();
  };

  return (
    <div className="space-y-6">
      <NewOrderAlert order={newOrder} />
      <div>
        <h1 className="font-serif text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">Monitor live orders, update fulfillment, and review audit history.</p>
      </div>
      {loading ? (
        <OrdersTableSkeleton />
      ) : (
        <OrdersTable
          orders={visibleOrders}
          filter={filter}
          search={search}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onView={handleView}
          onPrint={handlePrint}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
        />
      )}
      <OrderDetailsDrawer
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        timeline={timeline}
      />
    </div>
  );
}
