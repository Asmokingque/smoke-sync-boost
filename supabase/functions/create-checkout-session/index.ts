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
  specialId?: string;
  specialItemId?: string;
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
    const origin = req.headers.get("origin") || "";
    const returnUrl = cleanText(body.returnUrl, 500) || (origin ? `${origin}/checkout/success` : "");
    if (!returnUrl) return jsonResponse(400, { error: "returnUrl is required." });

    // Best-effort: if a user JWT is provided, link the order to that user.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: u } = await userClient.auth.getUser();
        userId = u?.user?.id ?? null;
      } catch (_) { /* anonymous checkout */ }
    }

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

    // Resolve regular menu items.
    const menuItemIds = [
      ...new Set(
        cartItems
          .filter((i) => !i.specialId && !i.specialItemId)
          .map((i) => i.menuItemId),
      ),
    ];
    let menuMap = new Map<string, any>();
    if (menuItemIds.length > 0) {
      const { data: menuRows, error: menuError } = await supabaseAdmin
        .from("menu_items")
        .select("id, name, description, price, is_available")
        .in("id", menuItemIds);
      if (menuError) throw menuError;
      menuMap = new Map(menuRows?.map((m) => [m.id, m]) ?? []);
    }

    // Resolve specials and special items for cart lines added from /specials.
    const specialIds = [
      ...new Set(
        cartItems
          .map((i) => i.specialId)
          .filter((v): v is string => !!v),
      ),
    ];
    let specialsMap = new Map<string, any>();
    if (specialIds.length > 0) {
      const { data: rows, error } = await supabaseAdmin
        .from("specials")
        .select("id, title, special_price, is_active, sold_out")
        .in("id", specialIds);
      if (error) throw error;
      specialsMap = new Map(rows?.map((r: any) => [r.id, r]) ?? []);
    }
    const specialItemIds = [
      ...new Set(
        cartItems
          .map((i) => i.specialItemId)
          .filter((v): v is string => !!v),
      ),
    ];
    let specialItemsMap = new Map<string, any>();
    if (specialItemIds.length > 0) {
      const { data: rows, error } = await supabaseAdmin
        .from("special_items")
        .select("id, item_name, special_price, is_active, special_id, menu_item_id")
        .in("id", specialItemIds);
      if (error) throw error;
      specialItemsMap = new Map(rows?.map((r: any) => [r.id, r]) ?? []);
    }

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
      const quantity = Math.min(Math.max(Number(ci.quantity || 1), 1), 25);

      // Special item line.
      if (ci.specialItemId) {
        const si = specialItemsMap.get(ci.specialItemId);
        if (!si || si.is_active === false) {
          throw new Error("One or more special items are no longer available.");
        }
        const parent = specialsMap.get(si.special_id);
        if (parent && (parent.is_active === false || parent.sold_out)) {
          throw new Error(`${parent.title ?? "Special"} is currently unavailable.`);
        }
        const unitPriceCents = toCents(si.special_price);
        if (unitPriceCents <= 0) throw new Error(`${si.item_name} does not have a valid price.`);
        return {
          menuItemId: si.menu_item_id ?? null,
          itemName: parent ? `${parent.title} — ${si.item_name}` : si.item_name,
          description: "",
          quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * quantity,
          selectedOptions: [] as { id: string; name: string; priceAdjustmentCents: number }[],
          notes: cleanText(ci.notes, 300),
        };
      }

      // Special-level line.
      if (ci.specialId) {
        const sp = specialsMap.get(ci.specialId);
        if (!sp || sp.is_active === false) {
          throw new Error("One or more specials are no longer available.");
        }
        if (sp.sold_out) throw new Error(`${sp.title} is sold out.`);
        const unitPriceCents = toCents(sp.special_price);
        if (unitPriceCents <= 0) throw new Error(`${sp.title} does not have a valid price.`);
        return {
          menuItemId: null,
          itemName: sp.title,
          description: "",
          quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * quantity,
          selectedOptions: [] as { id: string; name: string; priceAdjustmentCents: number }[],
          notes: cleanText(ci.notes, 300),
        };
      }

      // Regular menu item.
      const m = menuMap.get(ci.menuItemId);
      if (!m) throw new Error("One or more menu items could not be found.");
      if (!m.is_available) throw new Error(`${m.name} is currently unavailable.`);
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
        menuItemId: m.id as string | null,
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
    const totalCents = taxableCents + taxCents + deliveryFeeCents + tipCents;
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
        user_id: userId,
        customer_name: customerName,
        customer_phone: phone,
        customer_email: email || "",
        order_type: orderType,
        pickup_time: pickupTimestamp,
        delivery_address: orderType === "Delivery" ? deliveryAddress : null,
        notes: noteParts.length ? noteParts.join(" • ") : null,
        subtotal: subtotalCents / 100,
        tax: taxCents / 100,
        service_fee: 0,
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
