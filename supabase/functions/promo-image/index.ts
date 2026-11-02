// Admin only: generate branded promo images through Lovable AI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { generatePromoImage } from "../_shared/promoImageGateway.ts";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SIZES: Record<string, string> = { square: "1024x1024", landscape: "1536x1024", portrait: "1024x1536" };
const BRAND_STYLE =
  "Premium Texas smokehouse food photography for Anderson's Smoking Que. Dark moody background, charcoal and ember tones, " +
  "warm rim lighting, subtle wood smoke, rustic wood and cast iron, thin gold accents, appetizing glistening bark, " +
  "shallow depth of field, high-end editorial look. No text, no logos, no watermarks.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !anonKey || !serviceKey) return json({ error: "Image service is not configured." }, 500);
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Not authenticated." }, 401);
  const authClient = createClient(SUPABASE_URL, anonKey);
  const { data: u } = await authClient.auth.getUser(token);
  if (!u?.user) return json({ error: "Not authenticated." }, 401);
  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: me } = await admin.from("admin_users").select("id")
    .eq("user_id", u.user.id).eq("is_active", true).maybeSingle();
  if (!me) return json({ error: "Only an active admin can generate images." }, 403);

  let body: { prompt?: unknown; size?: unknown; stream?: unknown } = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid request body." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid request body." }, 400);
  if (body.stream !== undefined && typeof body.stream !== "boolean") return json({ error: "Invalid stream option." }, 400);
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length < 3 || prompt.length > 800) return json({ error: "Describe the image in 3–800 characters." }, 400);
  const size = SIZES[typeof body.size === "string" ? body.size : "square"];
  if (!size) return json({ error: "Invalid size." }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "Built-in AI is not configured." }, 500);
  try {
    const res = await generatePromoImage(LOVABLE_API_KEY, `${prompt}. ${BRAND_STYLE}`, size, body.stream !== false);
    return new Response(res.body, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": res.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-cache" },
    });
  } catch {
    return json({ error: "Could not reach the image service. Please try again later." }, 502);
  }
});
