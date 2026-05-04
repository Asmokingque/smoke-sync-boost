// Server-side checkout session creator using Lovable's managed Stripe gateway.
// Returns an Embedded Checkout client_secret. Order is created in Pending state;
// payments-webhook marks it paid + confirmed on checkout.session.completed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CartItemInput = {
  menuItemId: string;
  quantity: number;
  selectedOptionIds?: string[];
  notes?: string;
};

type CustomerInfoInput = {
  customerName: string;
  phone: string;
  email?: string;
  orderType: "Pickup" | "Delivery";
  pickupDate?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  orderNotes?: string;
  tipCents?: number;
  communityGroup?: string;
};

const TAX_RATE = 0.0825;
const DELIVERY_FEE_CENTS = 699;
const DELIVERY_FREE_THRESHOLD_CENTS = 7500;
const HEROES_PERCENT = 0.10;
const HEROES_CAP_CENTS = 2500;
const ELIGIBLE_GROUPS = new Set(["Law Enforcement", "Firefighter", "Teacher", "Veteran"]);

function cleanText(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}
function toCents(value: unknown): number {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(500, { error: "Backend is not configured." });

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonResponse(400, { error: "Invalid request body." });

    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const returnUrl = cleanText(body.returnUrl, 500);
    if (!returnUrl) return jsonResponse(400, { error: "returnUrl is required." });

    const stripe = createStripeClient(env);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const cartItems = body.cartItems as CartItemInput[];
    const customerInfo = (body.customerInfo ?? {}) as CustomerInfoInput;

    if (!Array.isArray(cartItems) || cartItems.length === 0) return jsonResponse(400, { error: "Cart is empty." });
    if (cartItems.length > 50) return jsonResponse(400, { error: "Cart has too many items." });

    const customerName = cleanText(customerInfo.customerName, 100);
    const phone = cleanText(customerInfo.phone, 40);
    const email = cleanText(customerInfo.email, 120);
    const orderType = customerInfo.orderType === "Delivery" ? "Delivery" : "Pickup";
    const deliveryAddress = orderType === "Delivery" ? cleanText(customerInfo.deliveryAddress, 250) : "";

    if (!customerName || !phone) return jsonResponse(400, { error: "Customer name and phone are required." });
    if (orderType === "Delivery" && deliveryAddress.length < 6) {
      return jsonResponse(400, { error: "Delivery address is required for delivery orders." });
    }

    const menuItemIds = [...new Set(cartItems.map((i) => i.menuItemId))];
    const { data: menuRows, error: menuError } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, description, price, is_available")
      .in("id", menuItemIds);
    if (menuError) throw menuError;
    const menuMap = new Map(menuRows?.map((m) => [m.id, m]) ?? []);

    const optionIds = [...new Set(cartItems.flatMap((i) => i.selectedOptionIds ?? []).filter(Boolean))];
    let optionMap = new Map<string, { id: string; option_name: string; price_adjustment: number }>();
    if (optionIds.length > 0) {
      const { data: opts, error: optErr } = await supabaseAdmin
        .from("menu_item_options")
        .select("id, option_name, price_adjustment")
        .in("id", optionIds);
      if (optErr) throw optErr;
      optionMap = new Map(opts?.map((o: any) => [o.id, o]) ?? []);
    }

    const calculated = cartItems.map((ci) => {
      const m = menuMap.get(ci.menuItemId);
      if (!m) throw new Error("One or more menu items could not be found.");
      if (!m.is_available) throw new Error(`${m.name} is currently unavailable.`);
      const quantity = Math.min(Math.max(Number(ci.quantity || 1), 1), 25);
      const basePriceCents = toCents(m.price);
      if (basePriceCents <= 0) throw new Error(`${m.name} does not have a valid price.`);
      const selectedOptions = (ci.selectedOptionIds ?? []).map((id) => {
        const o = optionMap.get(id);
        if (!o) throw new Error("Invalid item option selected.");
        return { id: o.id, name: o.option_name, priceAdjustmentCents: toCents(o.price_adjustment) };
      });
      const optionsTotalCents = selectedOptions.reduce((s, o) => s + o.priceAdjustmentCents, 0);
      const unitPriceCents = basePriceCents + optionsTotalCents;
      return {
        menuItemId: m.id,
        itemName: m.name,
        description: m.description ?? "",
        quantity,
        unitPriceCents,
        lineTotalCents: unitPriceCents * quantity,
        selectedOptions,
        notes: cleanText(ci.notes, 300),
      };
    });

    const subtotalCents = calculated.reduce((s, i) => s + i.lineTotalCents, 0);
    const serviceFeeCents = Math.round(subtotalCents * SERVICE_FEE_RATE);
    const deliveryFeeCents =
      orderType === "Delivery" && subtotalCents < DELIVERY_FREE_THRESHOLD_CENTS ? DELIVERY_FEE_CENTS : 0;
    const tipCents = Math.min(Math.max(Number(customerInfo.tipCents || 0), 0), 50000);

    let discountName: string | null = null;
    let discountAmountCents = 0;
    let discountStatus: string = "None";
    let communityGroup: string | null = null;
    if (customerInfo.communityGroup && ELIGIBLE_GROUPS.has(customerInfo.communityGroup)) {
      communityGroup = customerInfo.communityGroup;
      discountName = "Community Heroes Deal";
      discountAmountCents = Math.min(Math.round(subtotalCents * HEROES_PERCENT), HEROES_CAP_CENTS);
      discountStatus = "Pending Verification";
    }

    const taxableCents = Math.max(0, subtotalCents - discountAmountCents);
    const taxCents = Math.round(taxableCents * TAX_RATE);
    const totalCents = taxableCents + taxCents + serviceFeeCents + deliveryFeeCents + tipCents;
    if (totalCents <= 0) return jsonResponse(400, { error: "Order total is invalid." });

    let pickupTimestamp: string | null = null;
    if (customerInfo.pickupDate) {
      const d = cleanText(customerInfo.pickupDate, 20);
      const t = cleanText(customerInfo.pickupTime, 10) || "12:00";
      const iso = new Date(`${d}T${t}:00`);
      if (!Number.isNaN(iso.getTime())) pickupTimestamp = iso.toISOString();
    } else if (customerInfo.pickupTime) {
      const iso = new Date(customerInfo.pickupTime);
      if (!Number.isNaN(iso.getTime())) pickupTimestamp = iso.toISOString();
    }

    const noteParts = [
      cleanText(customerInfo.orderNotes, 500),
      discountName
        ? `${discountName} (${communityGroup}) −$${(discountAmountCents / 100).toFixed(2)} pending verification`
        : null,
    ].filter(Boolean);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_phone: phone,
        customer_email: email || "",
        order_type: orderType,
        pickup_time: pickupTimestamp,
        delivery_address: orderType === "Delivery" ? deliveryAddress : null,
        notes: noteParts.length ? noteParts.join(" • ") : null,
        subtotal: subtotalCents / 100,
        tax: taxCents / 100,
        service_fee: serviceFeeCents / 100,
        delivery_fee: deliveryFeeCents / 100,
        tip: tipCents / 100,
        discount_name: discountName,
        discount_amount: discountAmountCents / 100,
        discount_status: discountStatus,
        community_group: communityGroup,
        total: totalCents / 100,
        payment_status: "pending",
        status: "pending",
      })
      .select("id, order_number")
      .single();
    if (orderError) throw orderError;

    const orderItemsPayload = calculated.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menuItemId,
      item_name: i.itemName,
      selected_options: i.selectedOptions,
      quantity: i.quantity,
      unit_price: i.unitPriceCents / 100,
      line_total: i.lineTotalCents / 100,
      notes: i.notes || null,
    }));
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItemsPayload);
    if (itemsError) throw itemsError;

    const lineItems = calculated.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "usd",
        unit_amount: i.unitPriceCents,
        product_data: {
          name: i.itemName,
          description:
            i.selectedOptions.map((o) => o.name).join(", ").slice(0, 250) || undefined,
        },
      },
    }));
    const pushFee = (name: string, amount: number) => {
      if (amount > 0) {
        lineItems.push({
          quantity: 1,
          price_data: { currency: "usd", unit_amount: amount, product_data: { name } },
        });
      }
    };
    pushFee("Estimated Tax", taxCents);
    pushFee("Service Fee", serviceFeeCents);
    pushFee("Delivery Fee", deliveryFeeCents);
    pushFee("Tip", tipCents);

    let discountsParam: any[] | undefined;
    if (discountAmountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmountCents,
        currency: "usd",
        duration: "once",
        name: discountName ?? "Discount",
      });
      discountsParam = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      line_items: lineItems,
      discounts: discountsParam,
      customer_email: email || undefined,
      return_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&order=${order.order_number ?? order.id}`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number ?? "",
      },
    });

    await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return jsonResponse(200, {
      clientSecret: session.client_secret,
      orderNumber: order.order_number,
      orderId: order.id,
    });
  } catch (err: any) {
    console.error("create-checkout-session error", err);
    return jsonResponse(400, { error: err?.message || "Unable to create secure checkout session." });
  }
});
