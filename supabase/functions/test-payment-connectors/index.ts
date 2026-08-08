// test-payment-connectors — runs the connector diagnostics for every provider
// and persists status + last tested time. Invoked nightly by a cron job, or
// manually from the Admin Dashboard ("Run all now").
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { runConnectorChecks, type ConnectorRow } from "../_shared/connectorChecks.ts";

const SETTING_KEY = "connector_auto_test";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const manual = body?.manual === true;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (!manual) {
      const { data: setting } = await supabase
        .from("business_settings")
        .select("setting_value")
        .eq("setting_key", SETTING_KEY)
        .maybeSingle();
      const cfg = (setting?.setting_value ?? {}) as { enabled?: boolean; hour_utc?: number };
      if (cfg.enabled !== true) {
        return json({ ok: true, skipped: true, message: "Scheduled connector testing is off." });
      }
      const hour = typeof cfg.hour_utc === "number" ? cfg.hour_utc : 8;
      if (new Date().getUTCHours() !== hour) {
        return json({ ok: true, skipped: true, message: `Not the scheduled hour (${hour}:00 UTC).` });
      }
    }


    const { data: connectors, error } = await supabase
      .from("payment_connectors")
      .select("id, provider, display_name, enabled, test_mode, connection_status, secret_refs, public_config, webhook_status")
      .order("display_order", { ascending: true });
    if (error) throw error;

    const testedAt = new Date().toISOString();
    const results = [];
    for (const c of connectors ?? []) {
      const result = await runConnectorChecks(supabase, c as unknown as ConnectorRow);
      await supabase
        .from("payment_connectors")
        .update({
          last_tested_at: testedAt,
          last_test_result: result.message,
          connection_status: result.status,
        })
        .eq("id", (c as any).id);
      results.push({ provider: c.provider, ok: result.ok, status: result.status, message: result.message });
    }

    await supabase
      .from("business_settings")
      .upsert(
        {
          setting_key: "connector_auto_test_last_run",
          setting_value: { ran_at: testedAt, manual, passed: results.filter((r) => r.ok).length, total: results.length },
        },
        { onConflict: "setting_key" },
      );

    return json({ ok: true, tested_at: testedAt, results });
  } catch (e) {
    return json({ ok: false, message: (e as Error).message }, 500);
  }
});
