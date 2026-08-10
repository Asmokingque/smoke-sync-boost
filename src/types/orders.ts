/**
 * orders.ts
 * Shared row types for orders, derived from the generated database types.
 */
import type { Tables } from "@/integrations/supabase/types";

export type OrderRow = Tables<"orders">;
export type OrderItemRow = Tables<"order_items">;
export type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

/** Shape stored in order_items.selected_options (Json column). */
export type SelectedOption = {
  id?: string;
  group?: string;
  name?: string;
  price?: number;
};

export type OrderStatus = OrderRow["status"];
