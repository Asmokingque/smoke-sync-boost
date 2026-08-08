/**
 * paymentConnectors.ts
 * Shared types + helpers for the Payment Connector Framework.
 * NOTE: no secret keys ever live here — only provider metadata, public config
 * and the *names* of Edge Function secrets that must be added later.
 */
import { supabase } from "@/integrations/supabase/client";

export type ConnectorStatus = "not_configured" | "test_mode" | "active" | "disabled" | "error";

export type PaymentConnector = {
  id: string;
  provider: string;
  display_name: string;
  enabled: boolean;
  test_mode: boolean;
  supported_methods: string[];
  public_config: Record<string, string>;
  secret_refs: string[];
  webhook_status: string;
  connection_status: ConnectorStatus;
  last_tested_at: string | null;
  last_test_result: string | null;
  notes: string | null;
  display_order: number;
  updated_at: string;
};

export type PaymentMethod = {
  id: string;
  method_key: string;
  label: string;
  description: string | null;
  provider: string;
  category: "standard" | "manual" | "catering" | string;
  is_manual: boolean;
  instructions: string | null;
  enabled: boolean;
  display_order: number;
};

export const MANUAL_PAYMENT_WARNING =
  "Your order will not be marked paid until Anderson’s Smoking Que confirms payment.";

export const STATUS_LABEL: Record<ConnectorStatus, string> = {
  not_configured: "Not Configured",
  test_mode: "Test Mode",
  active: "Active",
  disabled: "Disabled",
  error: "Error",
};

const asRow = (r: any): PaymentConnector => ({
  ...r,
  supported_methods: Array.isArray(r.supported_methods) ? r.supported_methods : [],
  secret_refs: Array.isArray(r.secret_refs) ? r.secret_refs : [],
  public_config: (r.public_config ?? {}) as Record<string, string>,
});

/** Full connector rows — Super Admin only (RLS enforced). */
export async function fetchConnectors(): Promise<PaymentConnector[]> {
  const { data, error } = await supabase
    .from("payment_connectors")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(asRow);
}

/**
 * Safe public connector directory (no secret refs, notes or diagnostics).
 * Used by storefront/checkout so visitors never read admin-only fields.
 */
export async function fetchPublicConnectors(): Promise<PaymentConnector[]> {
  const { data, error } = await supabase
    .from("public_payment_connectors")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) =>
    asRow({
      ...r,
      secret_refs: [],
      webhook_status: "",
      connection_status: r.enabled ? (r.test_mode ? "test_mode" : "active") : "disabled",
      last_tested_at: null,
      last_test_result: null,
      notes: null,
      updated_at: "",
    }),
  );
}

export async function fetchPaymentMethods(onlyEnabled = false): Promise<PaymentMethod[]> {
  let query = supabase.from("payment_methods").select("*").order("display_order", { ascending: true });
  if (onlyEnabled) query = query.eq("enabled", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PaymentMethod[];
}

/** A method is only offered at checkout if the method AND its connector are enabled. */
export function availableMethods(methods: PaymentMethod[], connectors: PaymentConnector[]) {
  const enabledProviders = new Set(connectors.filter((c) => c.enabled).map((c) => c.provider));
  return methods.filter((m) => m.enabled && enabledProviders.has(m.provider));
}

export function deriveStatus(c: Pick<PaymentConnector, "enabled" | "test_mode" | "connection_status">): ConnectorStatus {
  if (c.connection_status === "error") return "error";
  if (!c.enabled) return c.connection_status === "not_configured" ? "not_configured" : "disabled";
  return c.test_mode ? "test_mode" : "active";
}
