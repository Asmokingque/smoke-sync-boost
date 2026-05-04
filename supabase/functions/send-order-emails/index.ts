// Send order confirmation email to customer + notification to admin.
// Best-effort: requires RESEND_API_KEY (Resend connector). If missing, no-op.
//
// Body: { orderId: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "Support@Asmokingque.com";
const FROM_EMAIL = "Anderson's Smoking Que <onboarding@resend.dev>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendKey || !lovableKey) {
    return new Response(JSON.stringify({ skipped: "email not configured" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error("orderId required");

    const supabase = createClient(supabaseUrl!, serviceRoleKey!);
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (error || !order) throw new Error("Order not found");

    const itemsHtml = (order.order_items ?? [])
      .map((i: any) => `<tr><td>${i.quantity} × ${i.item_name}</td><td style="text-align:right">$${Number(i.line_total).toFixed(2)}</td></tr>`)
      .join("");

    const orderHtml = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h1 style="font-family:Georgia,serif;color:#C8A24A">Anderson's Smoking Que</h1>
        <p>Order <strong>${order.order_number ?? order.id}</strong> — <strong>${order.status}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${itemsHtml}
          <tr><td>Subtotal</td><td style="text-align:right">$${Number(order.subtotal).toFixed(2)}</td></tr>
          <tr><td>Tax</td><td style="text-align:right">$${Number(order.tax).toFixed(2)}</td></tr>
          ${Number(order.delivery_fee) > 0 ? `<tr><td>Delivery</td><td style="text-align:right">$${Number(order.delivery_fee).toFixed(2)}</td></tr>` : ""}
          ${Number(order.tip) > 0 ? `<tr><td>Tip</td><td style="text-align:right">$${Number(order.tip).toFixed(2)}</td></tr>` : ""}
          <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>$${Number(order.total).toFixed(2)}</strong></td></tr>
        </table>
        <p>${order.order_type === "Delivery" ? `Delivery to: ${order.delivery_address}` : "Pickup order"}</p>
        <p style="color:#666;font-size:12px">Questions? Reply to this email or call us.</p>
      </div>`;

    const send = async (to: string, subject: string, html: string) => {
      const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": resendKey,
        },
        body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
      });
      if (!r.ok) console.error("email send failed", to, await r.text());
    };

    if (order.customer_email) {
      await send(order.customer_email, `Order confirmed — ${order.order_number ?? ""}`, orderHtml);
    }
    await send(
      ADMIN_EMAIL,
      `New paid order ${order.order_number ?? ""} — ${order.customer_name}`,
      `<p>New paid order from ${order.customer_name} (${order.customer_phone}).</p>${orderHtml}`,
    );

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
