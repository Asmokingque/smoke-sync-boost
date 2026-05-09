// Public health check endpoint for external uptime monitors.
// Returns 200 when the database is reachable, 503 otherwise.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "no-store",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; latency_ms?: number; error?: string }> = {};
  let overallOk = true;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const t = Date.now();
    const { error } = await supabase.from("menu_items").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    checks.database = { ok: true, latency_ms: Date.now() - t };
  } catch (e) {
    overallOk = false;
    checks.database = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  const body = {
    status: overallOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    checks,
  };

  return new Response(JSON.stringify(body), {
    status: overallOk ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
