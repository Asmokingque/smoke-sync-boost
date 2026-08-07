// paypal-capture-order — placeholder stub (Payment Connector Framework).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({ ok: false, provider: "paypal", message: "Connector not configured" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
