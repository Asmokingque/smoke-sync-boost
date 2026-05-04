// Stripe webhook → updates order payment_status / status after Checkout.
// Public endpoint: signature-verified, no JWT required.
//
// Required secrets:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)

import Stripe from "npm:stripe@17.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing Stripe signature", { status: 400 });

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    // Deno needs the async variant (uses Web Crypto).
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        const paid = session.payment_status === "paid";

        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: paid ? "paid" : "processing",
            // Move to 'confirmed' once payment lands; admin progresses from there.
            status: paid ? "confirmed" : "pending",
            stripe_payment_intent_id: paymentIntentId,
            stripe_session_id: session.id,
          })
          .eq("id", orderId);
        if (error) throw error;
        console.log("Order paid:", session.metadata?.order_number ?? orderId);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;
        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "expired", status: "cancelled" })
          .eq("id", orderId);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!piId) break;
        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "refunded", status: "cancelled" })
          .eq("stripe_payment_intent_id", piId);
        break;
      }

      default:
        // Acknowledge other events without processing.
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook handler error", err);
    // Return 500 so Stripe retries.
    return new Response(err?.message || "Webhook error", { status: 500 });
  }
});
