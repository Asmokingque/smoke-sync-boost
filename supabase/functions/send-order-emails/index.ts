// Send order receipt + admin notification via Lovable Emails (transactional).
// Triggered from payments-webhook after a successful payment.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "Support@Asmokingque.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error("orderId required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (error || !order) throw new Error("Order not found");

    const items = (order.order_items ?? []).map((i: any) => ({
      quantity: i.quantity,
      item_name: i.item_name,
      line_total: i.line_total,
    }));

    const sharedData = {
      orderNumber: order.order_number ?? order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      status: order.status,
      orderType: order.order_type,
      deliveryAddress: order.delivery_address,
      items,
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryFee: order.delivery_fee,
      tip: order.tip,
      total: order.total,
    };

    // Customer receipt
    if (order.customer_email) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-receipt",
          recipientEmail: order.customer_email,
          idempotencyKey: `order-receipt-${order.id}`,
          templateData: sharedData,
        },
      });
    }

    // Admin notification
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-order-notification",
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `order-admin-${order.id}`,
        templateData: sharedData,
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-order-emails error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
