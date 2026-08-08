// create-payment-session — provider-agnostic router + connector diagnostics.
// With { dryRun: true } it runs simulated per-provider checks and returns a
// status the Admin Dashboard persists. No customer is ever charged here.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Check = { label: string; ok: boolean; detail: string };

/** Public config keys each provider needs before it can go live. */
const REQUIRED_CONFIG: Record<string, string[]> = {
  stripe: ["publishable_key"],
  square: ["application_id", "location_id"],
  paypal: ["client_id"],
  manual: [],
  catering: [],
};

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

    const secretRefs = (connector.secret_refs as string[] | null) ?? [];
    const missingSecrets = secretRefs.filter((n) => !Deno.env.get(n));
    const publicConfig = (connector.public_config ?? {}) as Record<string, string>;
    const requiredKeys = REQUIRED_CONFIG[provider] ?? [];
    const missingConfig = requiredKeys.filter((k) => !publicConfig[k]?.trim());

    const { count: methodCount } = await supabase
      .from("payment_methods")
      .select("id", { count: "exact", head: true })
      .eq("provider", provider)
      .eq("enabled", true);

    const checks: Check[] = [
      {
        label: "Connector enabled",
        ok: !!connector.enabled,
        detail: connector.enabled ? "Enabled in the dashboard." : "Connector is switched off.",
      },
      {
        label: "Backend secrets",
        ok: missingSecrets.length === 0,
        detail: secretRefs.length === 0
          ? "No secrets required for this provider."
          : missingSecrets.length === 0
            ? `All ${secretRefs.length} secret(s) present.`
            : `Missing: ${missingSecrets.join(", ")}`,
      },
      {
        label: "Public configuration",
        ok: missingConfig.length === 0,
        detail: requiredKeys.length === 0
          ? "No public config required."
          : missingConfig.length === 0
            ? `All required keys set (${requiredKeys.join(", ")}).`
            : `Missing: ${missingConfig.join(", ")}`,
      },
      {
        label: "Webhook endpoint",
        ok: connector.webhook_status === "verified" || secretRefs.length === 0,
        detail: `Webhook status: ${connector.webhook_status ?? "unknown"}.`,
      },
      {
        label: "Enabled payment methods",
        ok: (methodCount ?? 0) > 0,
        detail: `${methodCount ?? 0} method(s) enabled for this provider.`,
      },
    ];

    const blocking = checks.filter((c) => !c.ok);
    const ok = blocking.length === 0;
    const status = !connector.enabled
      ? (missingSecrets.length > 0 || missingConfig.length > 0 ? "not_configured" : "disabled")
      : ok
        ? (connector.test_mode ? "test_mode" : "active")
        : (missingSecrets.length > 0 || missingConfig.length > 0 ? "not_configured" : "error");

    const message = ok
      ? `${connector.display_name} passed all ${checks.length} checks (${connector.test_mode ? "test mode" : "live mode"}).`
      : `${connector.display_name}: ${blocking.length} of ${checks.length} checks failed — ${blocking.map((c) => c.label).join(", ")}.`;

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
