// create-payment-session — provider-agnostic router + connector diagnostics.
// With { dryRun: true } it runs simulated per-provider checks and returns a
// status the Admin Dashboard persists. No customer is ever charged here.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { runConnectorChecks, type ConnectorRow } from "../_shared/connectorChecks.ts";

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
    const dryRun = body?.dryRun === true;
    if (!/^[a-z_]{2,32}$/.test(provider)) return json({ ok: false, message: "Invalid provider" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: connector } = await supabase
      .from("payment_connectors")
      .select("provider, display_name, enabled, test_mode, connection_status, secret_refs, public_config, webhook_status")
      .eq("provider", provider)
      .maybeSingle();

    if (!connector) {
      return json({
        ok: false,
        provider,
        status: "not_configured",
        message: "Connector not configured",
        checks: [{ label: "Connector record", ok: false, detail: "No connector row found for this provider." }],
      });
    }

    const { ok, status, message, checks } = await runConnectorChecks(
      supabase,
      connector as unknown as ConnectorRow,
    );

    if (dryRun) return json({ ok, provider, status, test_mode: connector.test_mode, message, checks });

    if (!ok) return json({ ok: false, provider, status, message, checks });

    // Providers with server-side gateways are dispatched here once activated.
    return json({
      ok: true,
      provider,
      status,
      test_mode: connector.test_mode,
      message: `${connector.display_name} connector is enabled. Payment session handler not yet implemented.`,
    });
  } catch (e) {
    return json({ ok: false, status: "error", message: (e as Error).message }, 500);
  }
});
