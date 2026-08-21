import { useEffect } from "react";
import { toast } from "sonner";
import type { OrderWithItems } from "@/types/orders";

export function NewOrderAlert({ order }: { order: OrderWithItems | null }) {
  useEffect(() => {
    if (!order) return;
    toast.success(`New order received: ${order.order_number ?? order.id.slice(0, 8).toUpperCase()}`);
  }, [order]);

  return null;
}
