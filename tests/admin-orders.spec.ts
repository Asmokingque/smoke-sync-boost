import { describe, expect, it } from "vitest";
import { filterAdminOrders } from "@/lib/ordering";
import type { OrderWithItems } from "@/types/orders";

const baseOrder = {
  community_group: null,
  created_at: new Date().toISOString(),
  customer_email: "pit@example.com",
  customer_name: "Pit Master",
  customer_phone: "5551112222",
  delivery_address: null,
  delivery_fee: 0,
  discount_amount: null,
  discount_id: null,
  discount_name: null,
  discount_status: null,
  discount_verified_at: null,
  discount_verified_by: null,
  heroes_acknowledged: false,
  heroes_discount_amount: 0,
  heroes_discount_status: null,
  heroes_group: null,
  id: "11111111-1111-1111-1111-111111111111",
  notes: null,
  order_number: "ASQ-260821-0001",
  order_type: "Pickup",
  payment_status: "unpaid",
  pickup_time: null,
  service_fee: 0,
  status: "pending",
  stripe_payment_intent_id: null,
  stripe_session_id: null,
  subtotal: 20,
  tax: 1.65,
  tip: 0,
  total: 21.65,
  updated_at: new Date().toISOString(),
  user_id: null,
  order_items: [],
} satisfies OrderWithItems;

describe("admin order filters", () => {
  it("filters pending payment orders", () => {
    expect(filterAdminOrders([baseOrder], "pending_payment", "")).toHaveLength(1);
    expect(filterAdminOrders([{ ...baseOrder, payment_status: "paid" }], "pending_payment", "")).toHaveLength(0);
  });

  it("searches across customer fields", () => {
    expect(filterAdminOrders([baseOrder], "all", "pit master")).toHaveLength(1);
    expect(filterAdminOrders([baseOrder], "all", "0002")).toHaveLength(0);
  });
});
