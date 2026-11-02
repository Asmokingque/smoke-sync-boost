// Admin only: generate branded promo images through the Hugging Face connection.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const GATEWAY_URL = "https://connector-gateway.lovable.dev/udc_hugging_face";
const MODEL = "black-forest-labs/FLUX.1-schnell";
const SIZES: Record<string, string> = { square: "1024x1024", landscape: "1344x768", portrait: "768x1344" };
const BRAND_STYLE =
  "Premium Texas smokehouse food photography for Anderson's Smoking Que. Dark moody background, charcoal and ember tones, " +
  "warm rim lighting, subtle wood smoke, rustic wood and cast iron, thin gold accents, appetizing glistening bark, " +
  "shallow depth of field, high-end editorial look. No text, no logos, no watermarks.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Not authenticated." }, 401);
  const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: u } = await authClient.auth.getUser(token);
  if (!u?.user) return json({ error: "Not authenticated." }, 401);
  const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: me } = await admin.from("admin_users").select("id")
    .eq("user_id", u.user.id).eq("is_active", true).maybeSingle();
  if (!me) return json({ error: "Only an active admin can generate images." }, 403);

  let body: { prompt?: unknown; size?: unknown } = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid request body." }, 400); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length < 3 || prompt.length > 800) return json({ error: "Describe the image in 3–800 characters." }, 400);
  const size = SIZES[typeof body.size === "string" ? body.size : "square"];
  if (!size) return json({ error: "Invalid size." }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const HF_KEY = Deno.env.get("UDC_HUGGING_FACE_API_KEY");
  if (!LOVABLE_API_KEY || !HF_KEY) return json({ error: "Hugging Face connection is not configured." }, 500);

  const res = await fetch(`${GATEWAY_URL}/nscale/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": HF_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, prompt: `${prompt}. ${BRAND_STYLE}`, size, response_format: "b64_json", n: 1 }),
  });
  if (!res.ok) {
    const details = await res.text();
    console.error(`Hugging Face request failed [${res.status}]: ${details}`);
    let message = details;
    try { message = JSON.parse(details).error ?? details; } catch { /* keep text */ }
    return json({ error: typeof message === "string" ? message : "Image generation failed.", status: res.status }, res.status);
  }
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return json({ error: "Hugging Face returned no image." }, 502);
  return json({ image: `data:image/png;base64,${b64}` });
});
