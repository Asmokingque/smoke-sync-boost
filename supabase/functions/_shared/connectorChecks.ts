// Shared connector diagnostic checks used by create-payment-session (dry run)
// and the scheduled test-payment-connectors job.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type Check = { label: string; ok: boolean; detail: string };

/** Public config keys each provider needs before it can go live. */
export const REQUIRED_CONFIG: Record<string, string[]> = {
  stripe: ["publishable_key"],
  square: ["application_id", "location_id"],
  paypal: ["client_id"],
  manual: [],
  catering: [],
};

export type ConnectorRow = {
  provider: string;
  display_name: string;
  enabled: boolean;
  test_mode: boolean;
  connection_status: string;
  secret_refs: string[] | null;
  public_config: Record<string, string> | null;
  webhook_status: string | null;
};

export async function runConnectorChecks(supabase: SupabaseClient, connector: ConnectorRow) {
  const secretRefs = connector.secret_refs ?? [];
  const missingSecrets = secretRefs.filter((n) => !Deno.env.get(n));
  const publicConfig = connector.public_config ?? {};
  const requiredKeys = REQUIRED_CONFIG[connector.provider] ?? [];
  const missingConfig = requiredKeys.filter((k) => !publicConfig[k]?.trim());

  const { count: methodCount } = await supabase
    .from("payment_methods")
    .select("id", { count: "exact", head: true })
    .eq("provider", connector.provider)
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
  const misconfigured = missingSecrets.length > 0 || missingConfig.length > 0;
  const status = !connector.enabled
    ? (misconfigured ? "not_configured" : "disabled")
    : ok
      ? (connector.test_mode ? "test_mode" : "active")
      : (misconfigured ? "not_configured" : "error");

  const message = ok
    ? `${connector.display_name} passed all ${checks.length} checks (${connector.test_mode ? "test mode" : "live mode"}).`
    : `${connector.display_name}: ${blocking.length} of ${checks.length} checks failed — ${blocking.map((c) => c.label).join(", ")}.`;

  return { ok, status, message, checks };
}
