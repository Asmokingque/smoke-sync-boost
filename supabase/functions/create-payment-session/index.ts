// create-payment-session — provider-agnostic router stub.
// Returns "Connector not configured" until a provider is enabled + configured.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const provider = String(body?.provider ?? "");
    if (!/^[a-z_]{2,32}$/.test(provider)) return json({ ok: false, message: "Invalid provider" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: connector } = await supabase
      .from("payment_connectors")
      .select("provider, display_name, enabled, test_mode, connection_status, secret_refs")
      .eq("provider", provider)
      .maybeSingle();

    if (!connector) return json({ ok: false, message: "Connector not configured" }, 200);

    const missingSecrets = (connector.secret_refs as string[] ?? []).filter((n) => !Deno.env.get(n));
    if (!connector.enabled || missingSecrets.length > 0) {
      return json({
        ok: false,
        provider,
        message: "Connector not configured",
        enabled: connector.enabled,
        missing_secrets: missingSecrets,
      });
    }

    // Providers with server-side gateways are dispatched here once activated.
    return json({
      ok: true,
      provider,
      test_mode: connector.test_mode,
      message: `${connector.display_name} connector is enabled. Payment session handler not yet implemented.`,
    });
  } catch (e) {
    return json({ ok: false, message: (e as Error).message }, 500);
  }
});
