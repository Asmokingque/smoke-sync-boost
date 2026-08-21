import type { OrderWithItems } from "@/types/orders";

export const TAX_RATE = 0.0825;
export const DEFAULT_DELIVERY_FEE = 6.99;

export type EstimatedSummaryInput = {
  subtotal: number;
  taxRate?: number;
  serviceFee?: number;
  deliveryFee?: number;
  discount?: number;
  tip?: number;
};

export type EstimatedSummary = {
  subtotal: number;
  tax: number;
  serviceFee: number;
  deliveryFee: number;
  discount: number;
  tip: number;
  total: number;
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function clampCartQuantity(quantity: number, min = 1, max = 20) {
  return Math.min(Math.max(Math.round(quantity), min), max);
}

export function calculateEstimatedOrderSummary({
  subtotal,
  taxRate = TAX_RATE,
  serviceFee = 0,
  deliveryFee = 0,
  discount = 0,
  tip = 0,
}: EstimatedSummaryInput): EstimatedSummary {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscount = Math.max(0, discount);
  const taxableSubtotal = Math.max(0, safeSubtotal - safeDiscount);
  const tax = roundMoney(taxableSubtotal * taxRate);
  return {
    subtotal: roundMoney(safeSubtotal),
    tax,
    serviceFee: roundMoney(Math.max(0, serviceFee)),
    deliveryFee: roundMoney(Math.max(0, deliveryFee)),
    discount: roundMoney(safeDiscount),
    tip: roundMoney(Math.max(0, tip)),
    total: roundMoney(taxableSubtotal + tax + Math.max(0, serviceFee) + Math.max(0, deliveryFee) + Math.max(0, tip)),
  };
}

export type AdminOrderFilter =
  | "all"
  | "new"
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export function filterAdminOrders(
  orders: OrderWithItems[],
  filter: AdminOrderFilter,
  search: string,
) {
  const q = search.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesFilter = (() => {
      switch (filter) {
        case "all":
          return true;
        case "new":
          return order.status === "pending";
        case "pending_payment":
          return order.payment_status !== "paid" && order.status !== "cancelled";
        case "paid":
          return order.payment_status === "paid";
        default:
          return order.status === filter;
      }
    })();

    if (!matchesFilter) return false;
    if (!q) return true;

    return [
      order.order_number,
      order.customer_name,
      order.customer_phone,
      order.customer_email,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });
}

export function getOrderStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "New";
    case "ready":
      return "Ready for Pickup";
    case "out_for_delivery":
      return "Out for Delivery";
    default:
      return status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

export function getOrderBusinessMessage(status: string) {
  switch (status) {
    case "pending":
      return "We received your order and will confirm it shortly.";
    case "confirmed":
      return "Your order has been confirmed by the pit crew.";
    case "preparing":
      return "Your order is being prepared now.";
    case "ready":
      return "Your order is ready for pickup.";
    case "completed":
      return "Your order has been completed. Thank you for supporting Anderson's Smoking Que.";
    case "cancelled":
      return "This order has been cancelled. Please contact Anderson's Smoking Que with questions.";
    default:
      return "We are working on your order.";
  }
}
