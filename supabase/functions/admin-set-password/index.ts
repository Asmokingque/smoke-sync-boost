// Super Admin only: force-set a new password for an admin account.
// The target user does NOT receive a reset email — the password is changed
// immediately via the Admin API.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // --- 1. Identify the caller from their JWT -------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Not authenticated." }, 401);

  const authClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: userData, error: userErr } = await authClient.auth.getUser(token);
  const caller = userData?.user;
  if (userErr || !caller) return json({ error: "Not authenticated." }, 401);

  // --- 2. Caller must be an ACTIVE Super Admin -----------------------------
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerAdmin } = await admin
    .from("admin_users")
    .select("id, role, is_active")
    .eq("user_id", caller.id)
    .eq("is_active", true)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!callerAdmin) {
    return json({ error: "Only an active Super Admin can reset admin passwords." }, 403);
  }

  // --- 3. Validate input ----------------------------------------------------
  let body: { adminId?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const adminId = typeof body.adminId === "string" ? body.adminId.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!adminId) return json({ error: "Missing admin account id." }, 400);
  if (newPassword.length < 10 || newPassword.length > 72) {
    return json({ error: "Password must be between 10 and 72 characters." }, 400);
  }
  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return json(
      { error: "Password must include an uppercase letter, a lowercase letter, and a number." },
      400,
    );
  }

  // --- 4. Resolve the target admin -----------------------------------------
  const { data: target, error: targetErr } = await admin
    .from("admin_users")
    .select("id, email, user_id, role")
    .eq("id", adminId)
    .maybeSingle();

  if (targetErr) return json({ error: targetErr.message }, 500);
  if (!target) return json({ error: "Admin account not found." }, 404);
  if (!target.user_id) {
    return json(
      { error: "This admin hasn't signed up yet, so there's no password to set." },
      409,
    );
  }

  // --- 5. Force-set the password -------------------------------------------
  const { error: updateErr } = await admin.auth.admin.updateUserById(target.user_id, {
    password: newPassword,
  });
  if (updateErr) return json({ error: updateErr.message }, 500);

  // Require a password change on next sign-in only when resetting someone else.
  const selfReset = target.user_id === caller.id;
  if (!selfReset) {
    await admin.from("profiles").update({ must_change_password: true }).eq("user_id", target.user_id);
  }

  console.log(
    JSON.stringify({
      event: "admin_password_force_set",
      actor: caller.email,
      target: target.email,
      at: new Date().toISOString(),
    }),
  );

  return json({ success: true, email: target.email, mustChangePassword: !selfReset });
});
