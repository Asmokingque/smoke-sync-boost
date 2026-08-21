export type AnalyticsEventName =
  | "menu_item_viewed"
  | "menu_item_added"
  | "cart_opened"
  | "checkout_started"
  | "checkout_submitted"
  | "order_created";

export function trackEvent(_event: AnalyticsEventName, _payload?: Record<string, string | number | boolean | null | undefined>) {
  return undefined;
}
