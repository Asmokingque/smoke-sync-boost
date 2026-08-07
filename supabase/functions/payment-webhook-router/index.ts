// payment-webhook-router — placeholder stub. Verifies nothing yet; once a
// provider is activated its signature verification is added here.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") ?? "unknown";

  return new Response(
    JSON.stringify({ ok: false, provider, message: "Connector not configured" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
