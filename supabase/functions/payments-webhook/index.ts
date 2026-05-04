// Stripe webhook → updates order payment_status / status after Embedded Checkout.
// Routed via Lovable's managed payments gateway. Public: signature verified.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function notifyEmails(orderId: string) {
  // Best-effort email notifications. Skip silently if email infra not set up.
  try {
    await getSupabase().functions.invoke("send-order-emails", { body: { orderId } });
  } catch (e) {
    console.log("send-order-emails skipped:", (e as Error).message);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook with invalid env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    const supabase = getSupabase();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        const paid = session.payment_status === "paid";
        const { error } = await supabase
          .from("orders")
          .update({
            payment_status: paid ? "paid" : "processing",
            status: paid ? "confirmed" : "pending",
            stripe_payment_intent_id: paymentIntentId,
            stripe_session_id: session.id,
          })
          .eq("id", orderId);
        if (error) throw error;

        if (paid) await notifyEmails(orderId);
        console.log("Order paid:", session.metadata?.order_number ?? orderId);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as any;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;
        await supabase
          .from("orders")
          .update({ payment_status: "expired", status: "cancelled" })
          .eq("id", orderId);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as any;
        const piId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!piId) break;
        await supabase
          .from("orders")
          .update({ payment_status: "refunded", status: "cancelled" })
          .eq("stripe_payment_intent_id", piId);
        break;
      }
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
