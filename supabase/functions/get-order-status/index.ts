import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const messageForStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "We received your order and will confirm it shortly.";
    case "confirmed":
      return "Your order is confirmed and in queue.";
    case "preparing":
      return "Your order is being prepared now.";
    case "ready":
      return "Your order is ready for pickup.";
    case "completed":
      return "Your order has been completed. Thank you for supporting Anderson's Smoking Que.";
    case "cancelled":
      return "This order has been cancelled. Please contact the restaurant with questions.";
    default:
      return "We are working on your order.";
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Backend configuration is missing." });

  try {
    const body = await req.json().catch(() => null) as { orderNumber?: string; statusLookupToken?: string } | null;
    const orderNumber = body?.orderNumber?.trim().toUpperCase();
    const statusLookupToken = body?.statusLookupToken?.trim();
    if (!orderNumber || !statusLookupToken) return json(400, { error: "orderNumber and statusLookupToken are required." });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status, payment_status, order_type, pickup_time, pickup_date, total")
      .eq("order_number", orderNumber)
      .eq("status_lookup_token", statusLookupToken)
      .maybeSingle();
    if (error) throw error;
    if (!order) return json(404, { error: "Order not found." });

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("item_name, quantity")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    if (itemsError) throw itemsError;

    return json(200, {
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      orderType: order.order_type,
      pickupDate: order.pickup_date,
      pickupTime: order.pickup_time,
      items: (items ?? []).map((item) => ({ name: item.item_name, quantity: item.quantity })),
      total: Number(order.total),
      businessMessage: messageForStatus(order.status),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch order status.";
    return json(400, { error: message });
  }
});
