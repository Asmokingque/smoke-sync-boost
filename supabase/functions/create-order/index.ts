import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TAX_RATE = 0.0825;
const DELIVERY_FEE = 6.99;
const HEROES_DISCOUNT_RATE = 0.1;
const HEROES_GROUPS = new Set(["Law Enforcement", "Firefighters", "Teachers", "Veterans"]);

type IncomingCartItem = {
  cartItemId?: string;
  menuItemId: string;
  quantity: number;
  selectedOptionIds?: string[];
  notes?: string;
};

type RequestBody = {
  requestId: string;
  cartItems: IncomingCartItem[];
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  orderType: "Pickup" | "Delivery";
  pickupDate?: string | null;
  pickupTime?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  communityGroup?: string | null;
  tip?: number;
};

type MenuRow = {
  id: string;
  name: string;
  price: number | null;
  is_available: boolean;
  requires_options: boolean;
};

type OptionRow = {
  id: string;
  menu_item_id: string;
  option_group: string;
  option_name: string;
  price_adjustment: number;
  is_required: boolean;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const asText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const normalizeUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json(500, { error: "Backend configuration is missing." });
  }

  try {
    const body = (await req.json().catch(() => null)) as RequestBody | null;
    if (!body) return json(400, { error: "Invalid request body." });
    if (!normalizeUuid(body.requestId)) return json(400, { error: "requestId must be a UUID." });
    if (!Array.isArray(body.cartItems) || body.cartItems.length === 0) return json(400, { error: "Cart is empty." });
    if (body.cartItems.length > 50) return json(400, { error: "Cart is too large." });

    const customerName = asText(body.customer?.name, 100);
    const customerPhone = asText(body.customer?.phone, 30);
    const customerEmail = asText(body.customer?.email, 255);
    const orderType = body.orderType === "Delivery" ? "Delivery" : "Pickup";
    const customerNotes = asText(body.notes, 500);
    const deliveryAddress = orderType === "Delivery" ? asText(body.deliveryAddress, 300) : "";

    if (!customerName || !customerPhone || !customerEmail) {
      return json(400, { error: "Customer name, phone, and email are required." });
    }
    if (orderType === "Delivery" && deliveryAddress.length < 6) {
      return json(400, { error: "Delivery address is required for delivery orders." });
    }

    const tip = Number(body.tip ?? 0);
    if (!Number.isFinite(tip) || tip < 0 || tip > 500) {
      return json(400, { error: "Tip must be between $0.00 and $500.00." });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await userClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status, payment_status, total, order_type, pickup_time, pickup_date, delivery_address, status_lookup_token")
      .eq("checkout_request_id", body.requestId)
      .maybeSingle();

    if (existingOrder) {
      return json(200, {
        orderNumber: existingOrder.order_number,
        statusLookupToken: existingOrder.status_lookup_token,
        status: existingOrder.status,
        paymentStatus: existingOrder.payment_status,
        total: Number(existingOrder.total),
        pickupInfo: {
          orderType: existingOrder.order_type,
          pickupDate: existingOrder.pickup_date,
          pickupTime: existingOrder.pickup_time,
          deliveryAddress: existingOrder.delivery_address,
        },
      });
    }

    const menuItemIds = [...new Set(body.cartItems.map((item) => item.menuItemId))];
    const optionIds = [...new Set(body.cartItems.flatMap((item) => item.selectedOptionIds ?? []))];

    const [{ data: menuRows, error: menuError }, { data: optionRows, error: optionError }] = await Promise.all([
      supabaseAdmin
        .from("menu_items")
        .select("id, name, price, is_available, requires_options")
        .in("id", menuItemIds),
      optionIds.length
        ? supabaseAdmin
            .from("menu_item_options")
            .select("id, menu_item_id, option_group, option_name, price_adjustment, is_required")
            .in("id", optionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (menuError) throw menuError;
    if (optionError) throw optionError;

    const menuMap = new Map((menuRows ?? []).map((row) => [row.id, row as MenuRow]));
    const optionMap = new Map((optionRows ?? []).map((row) => [row.id, row as OptionRow]));

    const authoritativeItems = body.cartItems.map((item) => {
      const menuItem = menuMap.get(item.menuItemId);
      if (!menuItem) throw new Error("One or more menu items could not be found.");
      if (!menuItem.is_available) throw new Error(`${menuItem.name} is currently unavailable.`);
      const quantity = Math.min(Math.max(Math.round(Number(item.quantity || 1)), 1), 20);
      const selectedOptions = (item.selectedOptionIds ?? []).map((optionId) => {
        const option = optionMap.get(optionId);
        if (!option) throw new Error("Invalid item option selected.");
        if (option.menu_item_id !== menuItem.id) throw new Error("Selected options do not match the menu item.");
        return option;
      });

      const requiredGroups = new Set(
        (optionRows ?? [])
          .filter((option) => option.menu_item_id === menuItem.id && option.is_required)
          .map((option) => option.option_group),
      );
      for (const group of requiredGroups) {
        const hasSelection = selectedOptions.some((option) => option.option_group === group);
        if (!hasSelection) {
          throw new Error(`A required option is missing for ${menuItem.name}.`);
        }
      }

      const basePrice = Number(menuItem.price ?? 0);
      if (!(basePrice > 0)) throw new Error(`${menuItem.name} does not have a valid price.`);
      const optionTotal = selectedOptions.reduce((sum, option) => sum + Number(option.price_adjustment ?? 0), 0);
      const unitPrice = Math.round((basePrice + optionTotal) * 100) / 100;
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

      return {
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        quantity,
        unitPrice,
        lineTotal,
        notes: asText(item.notes, 300),
        selectedOptions: selectedOptions.map((option) => ({
          id: option.id,
          group: option.option_group,
          name: option.option_name,
          priceAdjustment: Number(option.price_adjustment ?? 0),
        })),
      };
    });

    const subtotal = Math.round(authoritativeItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
    const discount = body.communityGroup && HEROES_GROUPS.has(body.communityGroup)
      ? Math.round(subtotal * HEROES_DISCOUNT_RATE * 100) / 100
      : 0;
    const deliveryFee = orderType === "Delivery" ? DELIVERY_FEE : 0;
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableSubtotal * TAX_RATE * 100) / 100;
    const total = Math.round((taxableSubtotal + tax + deliveryFee + tip) * 100) / 100;
    if (total <= 0) return json(400, { error: "Order total is invalid." });

    const pickupDate = asText(body.pickupDate, 20) || null;
    const pickupTimeText = asText(body.pickupTime, 10) || null;
    const pickupTimestamp = pickupDate && pickupTimeText ? new Date(`${pickupDate}T${pickupTimeText}:00`).toISOString() : null;

    const noteParts = [customerNotes].filter(Boolean);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        checkout_request_id: body.requestId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        order_type: orderType,
        pickup_date: pickupDate,
        pickup_time: pickupTimestamp,
        delivery_address: orderType === "Delivery" ? deliveryAddress : null,
        notes: noteParts.join(" • ") || null,
        community_group: body.communityGroup && HEROES_GROUPS.has(body.communityGroup) ? body.communityGroup : null,
        discount_name: discount > 0 ? "Community Heroes Deal" : null,
        discount_amount: discount > 0 ? discount : null,
        discount_status: discount > 0 ? "pending_verification" : null,
        subtotal,
        tax,
        service_fee: 0,
        delivery_fee: deliveryFee,
        tip,
        total,
        payment_status: "unpaid",
        status: "pending",
      })
      .select("id, order_number, status_lookup_token, status, payment_status, total, order_type, pickup_date, pickup_time, delivery_address")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      authoritativeItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        item_name: item.itemName,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
        selected_options: item.selectedOptions,
        notes: item.notes || null,
      })),
    );
    if (itemsError) throw itemsError;

    const { error: historyError } = await supabaseAdmin.from("order_status_history").insert({
      order_id: order.id,
      previous_status: null,
      new_status: "pending",
      notes: "Order created",
      changed_by: userId,
    });
    if (historyError) throw historyError;

    return json(200, {
      orderNumber: order.order_number,
      statusLookupToken: order.status_lookup_token,
      status: order.status,
      paymentStatus: order.payment_status,
      total: Number(order.total),
      pickupInfo: {
        orderType: order.order_type,
        pickupDate: order.pickup_date,
        pickupTime: order.pickup_time,
        deliveryAddress: order.delivery_address,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return json(400, { error: message });
  }
});
