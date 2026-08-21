import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceRoleKey || !anonKey) return json(500, { error: "Backend configuration is missing." });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Missing admin token." });

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: authData } = await userClient.auth.getUser();
    const user = authData.user;
    if (!user) return json(401, { error: "Unauthorized." });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: adminRow, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("user_id, is_active")
      .eq("user_id", user.id)
      .maybeSingle();
    if (adminError) throw adminError;
    if (!adminRow?.is_active) return json(403, { error: "Admin access required." });

    const body = await req.json().catch(() => null) as {
      orderId?: string;
      status?: string;
      paymentStatus?: string;
      discountStatus?: string;
      discountVerified?: boolean;
      internalNotes?: string | null;
    } | null;
    if (!body?.orderId) return json(400, { error: "orderId is required." });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", body.orderId)
      .single();
    if (orderError) throw orderError;

    const patch: Record<string, unknown> = {};
    if (body.status) patch.status = body.status;
    if (body.paymentStatus) patch.payment_status = body.paymentStatus;
    if (typeof body.internalNotes === "string") patch.internal_notes = body.internalNotes.trim().slice(0, 1000);
    if (body.discountStatus) patch.discount_status = body.discountStatus;
    if (body.discountVerified) {
      patch.discount_verified_at = new Date().toISOString();
      patch.discount_verified_by = user.id;
    }

    if (!Object.keys(patch).length) return json(400, { error: "No allowed changes provided." });

    const { error: updateError } = await supabaseAdmin.from("orders").update(patch).eq("id", body.orderId);
    if (updateError) throw updateError;

    if (body.status && body.status !== order.status) {
      const { error: historyError } = await supabaseAdmin.from("order_status_history").insert({
        order_id: body.orderId,
        previous_status: order.status,
        new_status: body.status,
        changed_by: user.id,
        notes: typeof body.internalNotes === "string" ? body.internalNotes.trim().slice(0, 500) : null,
      });
      if (historyError) throw historyError;
    }

    return json(200, { ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order.";
    return json(400, { error: message });
  }
});
